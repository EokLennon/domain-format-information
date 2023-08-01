interface Card {
  id: number | string
  name: string
  desc: string
  archetype: string | null
  type: string
  frameType: string
  race: string
  card_images: CardImage[]
  atk?: number
  def?: number
  level?: number
  attribute?: string
  scale?: number
  linkval?: number
  linkmarkers?: string[]
}

interface CardImage {
  id: number
  image_url: string
  image_url_cropped: string
  image_url_small: string
}

export default Card;