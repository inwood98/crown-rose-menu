import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { computeMenuData, EMPTY_CONFIG, type MenuConfig, type MenuData } from './menuConfig'

const MenuCtx = createContext<MenuData>(computeMenuData(EMPTY_CONFIG))

export function useMenu(): MenuData {
  return useContext(MenuCtx)
}

export function MenuProvider({ config, children }: { config: MenuConfig; children: ReactNode }) {
  const value = useMemo(() => computeMenuData(config), [config])
  return <MenuCtx.Provider value={value}>{children}</MenuCtx.Provider>
}
