import create from 'zustand'

interface PaneStore {
  form: any
}

const usePaneStore = create<PaneStore>((set) => ({
  form: null

  // increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  // removeAllBears: () => set({ bears: 0 })
}))

export default usePaneStore
