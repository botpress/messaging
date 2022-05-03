import { Collapse as BpCollapse, Icon } from '@blueprintjs/core'
import React, { FC } from 'react'

// import BlockList from '../../../formKit/blockSelectors/BlockList'
import style from './style.scss'

export type CollapseClick = (id: string, idx: number, event: React.MouseEvent) => void

interface OwnProps {
  id: string
  form: any
  label: string
  idx?: number
  active?: boolean
  onClick?: CollapseClick
  onUpdate?: any
}

const Collapse: FC<OwnProps> = ({
  id,
  form,
  label,
  idx = 0,
  active = false,
  onClick = () => {},
  onUpdate = () => {}
}) => {
  return (
    <>
      <div onClick={(e) => onClick(id, idx, e)} className={style.form}>
        {active ? <Icon icon="chevron-down" size={20} /> : <Icon icon="chevron-up" size={20} />} {label}
      </div>
      <BpCollapse isOpen={active}>
        {form.map((f: any) => {
          if (f.type === 'block-list') {
            // return <BlockList id={f.id} {...f.props} />
            return <div>block list</div>
          }
          return <div className={style.test}>hello fromhere i guess?</div>
        })}
      </BpCollapse>
    </>
  )
}

export default Collapse

{
  /* <Provider >
  <Form form={el.form} label={el.label}></Form>
</Provider> */
}
