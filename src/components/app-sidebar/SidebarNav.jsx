"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { usePermission } from "@/features/permissions/components/PermissionsProvider"
import { navItems } from "@/features/shared/lib/data/sidebar"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

/**
 * Pure function to check if an item should be visible based on user permissions.
 * @param {Object} item - Navigation item.
 * @param {Function} can - Permission checking function from hook.
 * @returns {boolean}
 */
function isAuthorized(item, can) {
  // If item explicitly requires a permission, check it.
  if (item.permission && !can(item.permission)) {
    return false
  }

  // If item has sub-items, it's only visible if at least one sub-item is authorized.
  if (item.items?.length > 0) {
    return item.items.some(sub => isAuthorized(sub, can))
  }

  return true
}

export function SidebarNav() {
  const { can } = usePermission()

  // Filter items based on permissions before rendering
  const authorizedItems = navItems
    .filter(item => isAuthorized(item, can))
    .map(item => {
      // If it has children, filter them as well
      if (item.items) {
        return {
          ...item,
          items: item.items.filter(sub => isAuthorized(sub, can))
        }
      }
      return item
    })

  if (authorizedItems.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarMenu>

        {authorizedItems.map((item) => {
          // Si no tiene items hijos, renderiza un link simple
          if (!item.items?.length) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // Si tiene items hijos, renderiza el collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
