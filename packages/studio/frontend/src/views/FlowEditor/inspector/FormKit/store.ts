import create from 'zustand'

interface FormKitStore {
  form: any
  activeCollapse: number
  setActiveCollapse: (idx: number) => void
  resetKit: () => void
}

const useFormKitStore = create<FormKitStore>((set, get) => ({
  // Forms
  form: {},
  // updateForm
  // Collapse
  activeCollapse: 0,
  setActiveCollapse: (idx) => set(() => ({ activeCollapse: idx })),
  // SidePane
  // Reset Kit
  resetKit: () => set(() => ({ form: {}, activeCollapse: 0 }))

  // increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  // removeAllBears: () => set({ bears: 0 })
}))

export default useFormKitStore
