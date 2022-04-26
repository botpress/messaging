import { Button, Callout, FileInput, FormGroup, InputGroup, Intent, TextArea } from '@blueprintjs/core'
import axios from 'axios'
import { BotConfig } from 'botpress/sdk'
import { BotEditSchema } from 'common/validation'
import Joi from 'joi'
import _ from 'lodash'
import React, { Component } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { connect } from 'react-redux'
import Select from 'react-select'
import { fetchBotInformation, fetchBotLicense } from '~/actions'
import confirmDialog from '~/components/Shared/ConfirmDialog'
import { Container, SidePanel, SidePanelSection, ItemList } from '~/components/Shared/Interface'
import { toast } from '~/components/Shared/Toaster'
import { lang } from '~/components/Shared/translations'
import { toastFailure, toastSuccess } from '~/components/Shared/Utils/Toaster'
import { RootReducer } from '~/reducers'
import { BotReducer } from '~/reducers/bot'
import { getNLUServerClient } from '~/util/nlu-client-provider'

import style from './style.scss'

const statusList = ['public', 'private', 'disabled']

const axiosConfig = {
  baseURL: 'api/v1/'
}

interface StateBot {
  id: string
  name: string
  status: SelectItem
  description: string
  selectedDefaultLang: SelectItem
  selectedLanguages: SelectItem[]
  website: string
  phoneNumber: string
  emailAddress: string
  termsConditions: string
  privacyPolicy: string
  avatarUrl: string
  coverPictureUrl: string
}

interface StateVars {
  languages: SelectItem[]
  statuses: SelectItem[]
  error: any
  isSaving: boolean
  items: any[]
  activeTab?: string
}

type State = StateBot & StateVars

interface SelectItem {
  label: string
  value: string
}

class ConfigView extends Component<Props, State> {
  initialFormState: StateBot = {
    id: '',
    name: '',
    status: { value: '', label: '' },
    description: '',
    selectedDefaultLang: { value: '', label: '' },
    selectedLanguages: [],
    website: '',
    phoneNumber: '',
    emailAddress: '',
    termsConditions: '',
    privacyPolicy: '',
    avatarUrl: '',
    coverPictureUrl: ''
  }

  sideBarItems = [
    {
      label: lang.tr('general'),
      value: 'main',
      icon: 'cog',
      selected: true
    },
    {
      label: lang.tr('config.additionalDetails'),
      value: 'details',
      icon: 'list-detail-view',
      selected: false
    },
    {
      label: lang.tr('config.avatarAndCover'),
      value: 'pictures',
      icon: 'media',
      selected: false
    }
  ]

  state: State = {
    ...this.initialFormState,
    languages: [],
    statuses: [],
    error: undefined,
    isSaving: false,
    items: this.sideBarItems,
    activeTab: 'main'
  }

  async componentDidMount() {
    const bot = this.props.bot
    await this.fetchLanguages()
    if (!bot) {
      this.props.fetchBotInformation()
    }
    if (!this.props.license) {
      this.props.fetchBotLicense()
    }

    const initialState = !!bot ? this.getBotStateFromConfig(bot) : this.initialFormState

    this.setState({ ...initialState })
  }

  getBotStateFromConfig(bot: BotConfig) {
    const { languages } = this.state

    const statuses = statusList.map<SelectItem>((x) => ({
      label: lang.tr(`status.${x}`),
      value: x
    }))

    return {
      id: bot.id,
      name: bot.name || '',
      status: statuses.find((s) => s.value === status),
      description: bot.description || '',
      selectedDefaultLang: languages.find((l) => l.value === bot.defaultLanguage),
      selectedLanguages: languages.filter((x) => bot?.languages?.includes(x.value) ?? []),
      website: bot?.details.website || '',
      phoneNumber: bot?.details.phoneNumber || '',
      emailAddress: bot?.details.emailAddress || '',
      termsConditions: bot.details.termsConditions || '',
      privacyPolicy: bot.details.privacyPolicy || '',
      avatarUrl: bot.details.avatarUrl || '',
      coverPictureUrl: bot.details.coverPictureUrl || '',
      statuses
    }
  }

  async componentDidUpdate(prevProps: Readonly<Props>) {
    if (!prevProps.bot && this.props.bot) {
      const state = await this.getBotStateFromConfig(this.props.bot)
      this.setState({ ...state })
    }
  }

  async fetchLanguages() {
    const nluClient = getNLUServerClient()
    const response = await nluClient.getInfo()

    const languagesOptions: SelectItem[] = response.success
      ? response.info.languages.map((l) => ({
          label: lang.tr(`isoLangs.${l.toLowerCase()}.name`),
          value: l
        }))
      : []

    return this.setState({ languages: languagesOptions })
  }

  saveChanges = async () => {
    if (this.state.isSaving) {
      return
    }

    this.setState({ error: undefined, isSaving: true })

    const bot: Partial<BotConfig> = {
      name: this.state.name,
      disabled: this.state?.status?.value === 'disabled',
      private: this.state?.status?.value === 'private',
      description: this.state.description,
      defaultLanguage: this.state.selectedDefaultLang.value,
      languages: this.state.selectedLanguages.map((x) => x.value),
      details: {
        website: this.state.website,
        phoneNumber: this.state.phoneNumber,
        emailAddress: this.state.emailAddress,
        termsConditions: this.state.termsConditions,
        privacyPolicy: this.state.privacyPolicy,
        avatarUrl: this.state.avatarUrl,
        coverPictureUrl: this.state.coverPictureUrl
      }
    }

    const { error } = Joi.validate(bot, BotEditSchema)
    if (error) {
      toastFailure(lang.tr('config.formContainsErrors'))
      this.setState({ error, isSaving: false })
      return
    }

    try {
      const disableChanged = bot.disabled !== (this.initialFormState.status.value === 'disabled')
      let allow = true

      if (disableChanged && bot.disabled) {
        allow = await confirmDialog(lang.tr('config.confirmUnmount'), {
          acceptLabel: 'Unmount'
        })
      }

      if (allow) {
        await axios.post(`studio/${this.props.bot.id}/config`, bot, axiosConfig)
        toastSuccess(lang.tr('config.configUpdated'))
        this.setState({ error: undefined, isSaving: false })

        if (disableChanged) {
          window.location.reload()
        } else {
          this.props.fetchBotInformation()
        }
      } else {
        this.setState({ error: undefined, isSaving: false })
      }
    } catch (err) {
      this.setState({ error: err.response?.data, isSaving: false })
    }
  }

  handleInputChanged = (event) => {
    // @ts-ignore
    this.setState({ [event.target.name]: event.target.value })
  }

  handleStatusChanged = (status) => {
    this.setState({ status })
  }

  handleDefaultLangChanged = async (language) => {
    let langs = this.state.selectedLanguages
    if (!langs.find((x) => x.value === language.value)) {
      langs = [...langs, language]
    }

    if (!this.state.selectedDefaultLang) {
      this.setState({ selectedDefaultLang: language, selectedLanguages: langs })
      return
    }

    if (this.state.selectedDefaultLang !== language) {
      const currentName = this.state.languages.find((x) => x.value === this.state.selectedDefaultLang.value).label
      const newName = this.state.languages.find((x) => x.value === language.value).label
      const conf = await confirmDialog(lang.tr('confirmChangeLanguage', { currentName, newName }), {
        acceptLabel: 'Change'
      })

      if (conf) {
        this.setState({ selectedDefaultLang: language, selectedLanguages: langs })
      }
    }
  }

  handleLanguagesChanged = (langs) => {
    if (!langs.find((x) => x.value === this.state.selectedDefaultLang.value)) {
      langs = [...langs, this.state.selectedDefaultLang]
    }

    this.setState({ selectedLanguages: langs })
  }

  handleCommunityLanguageChanged = (lang) => {
    this.setState({ selectedDefaultLang: lang, selectedLanguages: [lang] })
  }

  handleImageFileChanged = async (event) => {
    const targetProp = event.target.name
    if (!event.target.files) {
      return
    }

    if (!event.target.files[0].type.includes('image/')) {
      this.setState({
        error: lang.tr('config.requireImageFile', { targetProp })
      })
      return
    }

    const data = new FormData()
    data.append('file', event.target.files[0])

    if (this.state.error) {
      this.setState({ error: null })
    }

    try {
      const res = await axios.post(`studio/${this.props.bot.id}/media`, data, {
        ...axiosConfig,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // @ts-ignore
      this.setState({ [targetProp]: res.data.url })
    } catch (err) {
      this.setState({ error: err })
    }
  }

  handleElementClicked = (item) => {
    for (const node of this.state.items) {
      node.selected = false
    }
    const originallySelected = item.selected
    item.selected = originallySelected == null ? true : !originallySelected
    this.setState({ activeTab: item.value })
  }

  render() {
    const keyMap = { save: 'ctrl+s' }

    const keyHandlers = {
      save: async (e) => {
        e.preventDefault()
        await this.saveChanges()
      }
    }

    return (
      <Container keyHandlers={keyHandlers} keyMap={keyMap}>
        <SidePanel>
          <SidePanelSection label={lang.tr('config.botConfiguration')}>
            <ItemList items={this.state.items} onElementClicked={this.handleElementClicked} />
          </SidePanelSection>
        </SidePanel>
        <div className={style.container}>
          {this.state.error && (
            <Callout className={style.callout} intent={Intent.DANGER} title="Error">
              {this.state.error.message}
            </Callout>
          )}
          <form>
            {this.state.activeTab === 'main' && (
              <div>
                <h1 className={style.title}>{lang.tr('general')}</h1>
                <FormGroup label={lang.tr('config.botId')} labelFor="id">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ flexGrow: 1, marginRight: '10px' }}>
                      <InputGroup id="id" name="id" value={this.state.id} readOnly />
                    </div>
                    <CopyToClipboard text={this.state.id} onCopy={() => toast.info(lang.tr('config.copyToClipboard'))}>
                      <Button icon="clipboard" />
                    </CopyToClipboard>
                  </div>
                </FormGroup>
                <FormGroup label={lang.tr('name')} labelFor="name">
                  <InputGroup
                    id="name"
                    name="name"
                    value={this.state.name}
                    maxLength={50}
                    onChange={this.handleInputChanged}
                  />
                </FormGroup>
                <FormGroup label={lang.tr('status')} labelFor="status">
                  <Select
                    id="status"
                    name="status"
                    options={this.state.statuses}
                    value={this.state.status}
                    onChange={this.handleStatusChanged}
                  />
                </FormGroup>
                <FormGroup label={lang.tr('config.description')} labelFor="description">
                  <TextArea
                    id="description"
                    name="description"
                    rows={3}
                    className={style.textarea}
                    value={this.state.description}
                    onChange={this.handleInputChanged}
                  />
                </FormGroup>
                {this.renderLanguages()}
              </div>
            )}
            {this.state.activeTab === 'details' && (
              <div>
                <h1>{lang.tr('details')}</h1>
                <FormGroup label={lang.tr('config.website')} labelFor="website">
                  <InputGroup
                    id="website"
                    leftIcon="globe"
                    placeholder="https://botpress.com"
                    name="website"
                    value={this.state.website}
                    onChange={this.handleInputChanged}
                  />
                </FormGroup>
                <FormGroup label={lang.tr('config.phoneNumber')} labelFor="phone-number">
                  <InputGroup
                    id="phone-number"
                    leftIcon="phone"
                    name="phoneNumber"
                    placeholder="(555) 555-5555"
                    value={this.state.phoneNumber}
                    onChange={this.handleInputChanged}
                  />
                </FormGroup>
                <FormGroup label={lang.tr('config.contactEmail')} labelFor="email-address">
                  <InputGroup
                    id="email-address"
                    leftIcon="envelope"
                    placeholder="email@botpress.com"
                    name="emailAddress"
                    value={this.state.emailAddress}
                    onChange={this.handleInputChanged}
                  />
                </FormGroup>
                <FormGroup label={lang.tr('config.linkToTerms')} labelFor="terms-conditions">
                  <InputGroup
                    id="terms-conditions"
                    name="termsConditions"
                    placeholder="https://botpress.com/terms"
                    value={this.state.termsConditions}
                    onChange={this.handleInputChanged}
                  />
                </FormGroup>
                <FormGroup label={lang.tr('config.linkToPolicy')} labelFor="privacy-policy">
                  <InputGroup
                    id="privacy-policy"
                    placeholder="https://botpress.com/privacy-policy"
                    name="privacyPolicy"
                    value={this.state.privacyPolicy}
                    onChange={this.handleInputChanged}
                  />
                </FormGroup>
              </div>
            )}
            {this.state.activeTab === 'pictures' && (
              <div>
                <h1>{lang.tr('pictures')}</h1>
                <FormGroup label={lang.tr('config.botAvatar')} labelFor="avatar-url">
                  <FileInput
                    text={lang.tr('config.chooseFile')}
                    inputProps={{
                      id: 'avatar-url',
                      name: 'avatarUrl',
                      accept: 'image/*',
                      onChange: this.handleImageFileChanged
                    }}
                  />
                  {this.state.avatarUrl !== this.initialFormState.avatarUrl && (
                    <p className={style.configUploadSuccess}>{lang.tr('config.avatarUploadSuccess')}</p>
                  )}
                  {this.state.avatarUrl && (
                    <img className={style.avatarPreview} alt="avatar" src={this.state.avatarUrl} />
                  )}
                </FormGroup>
                <FormGroup label={lang.tr('config.coverPicture')} labelFor="cover-picture-url">
                  <FileInput
                    text={lang.tr('config.chooseFile')}
                    inputProps={{
                      id: 'cover-picture-url',
                      name: 'coverPictureUrl',
                      accept: 'image/*',
                      onChange: this.handleImageFileChanged
                    }}
                  />
                  {this.state.coverPictureUrl !== this.initialFormState.coverPictureUrl && (
                    <p className={style.configUploadSuccess}>{lang.tr('config.coverUploadSuccess')}</p>
                  )}
                  {this.state.coverPictureUrl && (
                    <img className={style.coverPreview} alt="cover" src={this.state.coverPictureUrl} />
                  )}
                </FormGroup>
              </div>
            )}
            <FormGroup>
              <Button
                text={lang.tr('saveChanges')}
                intent="primary"
                id="btn-submit"
                icon="floppy-disk"
                disabled={this.state.isSaving}
                onClick={this.saveChanges}
              />
            </FormGroup>
          </form>
        </div>
      </Container>
    )
  }

  renderLanguages() {
    if (this.props.license?.isPro) {
      return (
        <div>
          <FormGroup label={lang.tr('config.defaultLanguage')} labelFor="selected-default-lang">
            <Select
              id="selected-default-lang"
              name="selectedDefaultLang"
              options={this.state.languages}
              value={this.state.selectedDefaultLang}
              onChange={this.handleDefaultLangChanged}
            />
          </FormGroup>
          <FormGroup label={lang.tr('config.supportedLanguages')} labelFor="selected-languages">
            <Select
              id="selected-languages"
              name="selectedLanguages"
              options={this.state.languages}
              value={this.state.selectedLanguages}
              onChange={this.handleLanguagesChanged}
              isMulti
            />
          </FormGroup>
        </div>
      )
    } else {
      return (
        <FormGroup label={lang.tr('config.language')} labelFor="selected-default-lang">
          <Select
            id="selected-default-lang"
            name="selectedDefaultLang"
            options={this.state.languages}
            value={this.state.selectedDefaultLang}
            onChange={this.handleCommunityLanguageChanged}
          />
        </FormGroup>
      )
    }
  }
}

const mapStateToProps = (state: RootReducer) => ({ ...state.bot })

const mapDispatchToProps = {
  fetchBotInformation,
  fetchBotLicense
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigView)

type Props = BotReducer & {
  fetchBotInformation: Function
  fetchBotLicense: Function
}
