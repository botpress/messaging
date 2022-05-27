// import { useFormikContext } from 'formik'
// import { FC } from 'react'
// import { connect } from 'react-redux'

// import { getCurrentFlowNode } from '../../../../../reducers'
// import { useDidMountEffect } from '../../../utils/useDidMountEffect'

// interface OwnProps {
//   currentNode: any
//   updateFlowNode: any
// }

// // Reset the context of Formik when the current node changes
// const SaveUnmount: FC<OwnProps> = ({ currentNode }) => {
//   const { values } = useFormikContext()
//   const { id } = currentNode

//   useDidMountEffect(() => {
//     resetForm()
//   }, [id])

//   return null
// }

// const mapStateToProps = (state) => ({
//   currentNode: getCurrentFlowNode(state as never) as any
// })

// const mapDispatchToProps = {
//   // deleteFlow,
//   // duplicateFlow,
//   // renameFlow
//   updateFlowNode
// }

// export default connect(mapStateToProps, mapDispatchToProps)(SaveUnmount)
