export type TimerColor = {
  id: string
  name: string
  bg: string
  text: string
}

export const TIMER_COLORS: TimerColor[] = [
  { id: "red", name: "Red", bg: "#FF0000", text: "#FFFFFF" },
  { id: "maroon", name: "Maroon", bg: "#800000", text: "#FFFFFF" },
  { id: "orange", name: "Orange", bg: "#FFA500", text: "#000000" },
  { id: "yellow", name: "Yellow", bg: "#FFFF00", text: "#000000" },
  { id: "gold", name: "Gold", bg: "#FFD700", text: "#000000" },
  { id: "green", name: "Green", bg: "#008000", text: "#FFFFFF" },
  { id: "teal", name: "Teal", bg: "#008080", text: "#FFFFFF" },
  { id: "blue", name: "Blue", bg: "#0000FF", text: "#FFFFFF" },
  { id: "navy", name: "Navy", bg: "#000080", text: "#FFFFFF" },
  { id: "purple", name: "Purple", bg: "#800080", text: "#FFFFFF" },
  { id: "pink", name: "Pink", bg: "#FFC0CB", text: "#000000" },
  { id: "white", name: "White", bg: "#FFFFFF", text: "#000000" },
  { id: "light-gray", name: "Light Gray", bg: "#D3D3D3", text: "#000000" },
  { id: "dark-gray", name: "Dark Gray", bg: "#4A4A4A", text: "#FFFFFF" },
  { id: "black", name: "Black", bg: "#000000", text: "#FFFFFF" },
]

export function getColorById(id?: string) {
  return TIMER_COLORS.find(c => c.id === id) || TIMER_COLORS[0]
}
