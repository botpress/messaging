import create from 'zustand'

interface InspectorStore {
  tabs: string[]
  activeTabIdx: number
  openTabId: (id: string) => void
  changeTab: (idx: number) => void
  closeTabIdx: (idx: number) => void
  activeCollapse: number
  setActiveCollapse: (idx: number) => void
  resetInspector: () => void
}

const useInspectorStore = create<InspectorStore>((set, get) => ({
  // TabBar
  tabs: [],
  activeTabIdx: -1,
  openTabId: (id) => {
    const { tabs } = get()
    const existingTab = tabs.indexOf(id)

    if (existingTab === -1) {
      set((state) => ({ tabs: [id, ...state.tabs], activeTabIdx: 0 }))
    } else {
      set((state) => ({ activeTabIdx: existingTab }))
    }
  },
  changeTab: (idx) => set(() => ({ activeTabIdx: idx })),
  closeTabIdx: (idx) =>
    set((state) => ({ tabs: state.tabs.filter((_, i) => i !== idx), activeTabIdx: state.activeTabIdx - 1 })),

  // Collapses
  activeCollapse: 0,
  setActiveCollapse: (idx) => set(() => ({ activeCollapse: idx })),
  // Reset Inspector
  resetInspector: () => set(() => ({ tabs: [], activeTabIdx: -1, activeCollapse: 0 }))
}))

export default useInspectorStore
