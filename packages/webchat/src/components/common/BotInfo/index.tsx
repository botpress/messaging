import classnames from 'classnames'
import { inject, observer } from 'mobx-react'
import React, { Fragment } from 'react'
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl'

import EmailIcon from '../../../icons/Email'
import PhoneIcon from '../../../icons/Phone'
import WebsiteIcon from '../../../icons/Website'
import { RootStore, StoreDef } from '../../../store'
import { renderUnsafeHTML } from '../../../utils'

import Avatar from '../Avatar'

const CoverPicture = ({ coverPictureUrl }: { coverPictureUrl: string }) => (
  <div className={'bpw-botinfo-cover-picture-wrapper'}>
    <img className={'bpw-botinfo-cover-picture'} src={coverPictureUrl} />
  </div>
)

class BotInfoPage extends React.Component<BotInfoProps> {
  private btnEl!: HTMLElement

  componentDidMount() {
    this.btnEl?.focus()
  }

  renderDescription(text: string) {
    const html = renderUnsafeHTML(text, this.props.escapeHTML!)
    return <div className={'bpw-botinfo-description'} dangerouslySetInnerHTML={{ __html: html }} />
  }

  changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value
    this.props.updatePreferredLanguage!(lang)
  }

  render() {
    const {
      botName,
      avatarUrl,
      coverPictureUrl,
      description,
      phoneNumber,
      website,
      emailAddress,
      termsConditions,
      privacyPolicy,
      botInfo
    } = this.props

    const onDismiss = this.props.isConversationStarted ? this.props.toggleBotInfo : this.props.startConversation
    return (
      <Fragment>
        <link rel="stylesheet" href="style.scss" />
        <div
          className={classnames('bpw-botinfo-container', {
            'bpw-rtl': this.props.rtl
          })}
        >
          {coverPictureUrl ? <CoverPicture coverPictureUrl={coverPictureUrl} /> : <div style={{ height: '42px' }} />}
          <div className={'bpw-botinfo-summary'}>
            <Avatar name={botName} avatarUrl={avatarUrl} height={64} width={64} />
            <h3 style={{ marginBottom: '10px' }}>{botName}</h3>
            {description && this.renderDescription(description)}
          </div>
          <React.Fragment>
            <div className={'bpw-botinfo-links'}>
              {phoneNumber && (
                <div className={'bpw-botinfo-link'}>
                  <i>
                    <PhoneIcon />
                  </i>
                  <a target={'_blank'} href={`tel:${phoneNumber}`}>
                    {phoneNumber}
                  </a>
                </div>
              )}
              {website && (
                <div className={'bpw-botinfo-link'}>
                  <i>
                    <WebsiteIcon />
                  </i>
                  <a target={'_blank'} href={website}>
                    {website}
                  </a>
                </div>
              )}
              {emailAddress && (
                <div className={'bpw-botinfo-link'}>
                  <i>
                    <EmailIcon />
                  </i>
                  <a target={'_blank'} href={`mailto:${emailAddress}`}>
                    {emailAddress}
                  </a>
                </div>
              )}
            </div>
            {termsConditions && (
              <div className={'bpw-botinfo-terms'}>
                <a target={'_blank'} href={termsConditions}>
                  <FormattedMessage id={'botInfo.termsAndConditions'} />
                </a>
              </div>
            )}
            {privacyPolicy && (
              <div className={'bpw-botinfo-terms'}>
                <a target={'_blank'} href={privacyPolicy}>
                  <FormattedMessage id={'botInfo.privacyPolicy'} />
                </a>
              </div>
            )}
          </React.Fragment>
          {botInfo?.languages && botInfo.languages.length > 1 && (
            <div className={'bpw-botinfo-preferred-language'}>
              <FormattedMessage id={'botInfo.preferredLanguage'} />
              <select value={this.props.preferredLanguage} onChange={this.changeLanguage}>
                {botInfo.languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            tabIndex={1}
            ref={(el) => (this.btnEl = el!)}
            className={'bpw-botinfo-start-button'}
            onClick={onDismiss!.bind(this, undefined)}
          >
            {this.props.isConversationStarted ? (
              <FormattedMessage id={'botInfo.backToConversation'} />
            ) : (
              <FormattedMessage id={'botInfo.startConversation'} />
            )}
          </button>
        </div>
      </Fragment>
    )
  }
}

export default inject(({ store }: { store: RootStore }) => ({
  coverPictureUrl: store.coverPictureUrl,
  description: store.description,
  phoneNumber: store.phoneNumber,
  website: store.website,
  emailAddress: store.emailAddress,
  termsConditions: store.termsConditions,
  privacyPolicy: store.privacyPolicy,
  botName: store.botName,
  botInfo: store.botInfo,
  avatarUrl: store.botAvatarUrl,
  startConversation: store.startConversation,
  toggleBotInfo: store.view.toggleBotInfo,
  isConversationStarted: store.isConversationStarted,
  updatePreferredLanguage: store.updatePreferredLanguage,
  preferredLanguage: store.preferredLanguage,
  escapeHTML: store.escapeHTML,
  rtl: store.rtl
}))(injectIntl(observer(BotInfoPage)))

type BotInfoProps = WrappedComponentProps &
  Pick<
    StoreDef,
    | 'coverPictureUrl'
    | 'description'
    | 'phoneNumber'
    | 'website'
    | 'emailAddress'
    | 'termsConditions'
    | 'privacyPolicy'
    | 'botInfo'
    | 'botName'
    | 'avatarUrl'
    | 'toggleBotInfo'
    | 'startConversation'
    | 'isConversationStarted'
    | 'updatePreferredLanguage'
    | 'preferredLanguage'
    | 'escapeHTML'
    | 'rtl'
  >
