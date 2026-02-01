import { Element } from '@/types/molecule'

let draggedElement: Element | null = null

export const setDraggedElement = (element: Element | null) => {
  draggedElement = element
}

export const getDraggedElement = () => {
  return draggedElement
}
