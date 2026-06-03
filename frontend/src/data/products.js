export const categories = [
  { idCategory: 1, categoryName: 'Vestidos' },
  { idCategory: 2, categoryName: 'Blusas & Tops' },
  { idCategory: 3, categoryName: 'Faldas & Pantalones' },
  { idCategory: 4, categoryName: 'Accesorios' },
  { idCategory: 5, categoryName: 'Abrigos & Chalecos' },
]

export const categoryImages = {
  1: 'https://images.unsplash.com/photo-1759992878336-a5dd342ea245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500&q=80',
  2: 'https://images.unsplash.com/photo-1585439623131-6a91ce98e4c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500&q=80',
  3: 'https://images.unsplash.com/photo-1768033976461-61ea7527ac1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500&q=80',
  4: 'https://images.unsplash.com/photo-1766560360636-69204af3c947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500&q=80',
  5: 'https://images.unsplash.com/photo-1773335954232-957e8945827e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500&q=80',
}

export const heroImage =
  'https://images.unsplash.com/photo-1768033976461-61ea7527ac1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1400&q=85'

export const philosophyImage =
  'https://images.unsplash.com/photo-1549412522-c8a0a5211846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80'

export const featuredProducts = [
  {
    idProduct: 1,
    category: categories[0],
    productName: 'Vestido Flores del Campo',
    productDescription:
      'Delicado vestido floral con escote envolvente y cintura ajustable. Confeccionado en tela ligera de algodon con estampado botanico en tonos tierra y rosa.',
    price: 89.99,
    stock: 15,
    imageProduct:
      'https://images.unsplash.com/photo-1759992878336-a5dd342ea245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 2,
    category: categories[0],
    productName: 'Vestido Crochet Lunar',
    productDescription:
      'Vestido maxi de crochet artesanal con detalles de encaje. Tejido a mano con hilos naturales, combina con sandalias de cuero o botas camperas.',
    price: 115,
    stock: 8,
    imageProduct:
      'https://images.unsplash.com/photo-1624633100912-2fc4f1002778?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 3,
    category: categories[0],
    productName: 'Vestido Midi Terracota',
    productDescription:
      'Vestido midi en tono terracota con mangas campana y escote en V. El color calido realza cualquier tono de piel.',
    price: 95,
    stock: 12,
    imageProduct:
      'https://images.unsplash.com/photo-1654943389011-2bb787c204ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 4,
    category: categories[0],
    productName: 'Vestido Etnico Multicolor',
    productDescription:
      'Vestido largo con bordados etnicos multicolores en el escote y dobladillo. Cada pieza es unica.',
    price: 110,
    stock: 6,
    imageProduct:
      'https://images.unsplash.com/photo-1655731407582-1222311cb11b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 5,
    category: categories[0],
    productName: 'Vestido Floral Jardin',
    productDescription:
      'Vestido de algodon estampado con flores silvestres. Tiene escote cuadrado, mangas globo y falda con vuelo.',
    price: 78,
    stock: 20,
    imageProduct:
      'https://images.unsplash.com/photo-1624633700872-63940c70c11f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 6,
    category: categories[1],
    productName: 'Blusa Bordada Artesanal',
    productDescription:
      'Blusa de algodon blanco con bordados artesanales en cuello y mangas. Comoda, fresca y unica.',
    price: 48,
    stock: 22,
    imageProduct:
      'https://images.unsplash.com/photo-1585439623131-6a91ce98e4c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 7,
    category: categories[1],
    productName: 'Top Macrame Boho',
    productDescription:
      'Top de macrame tejido a mano con cierre trasero de cordones. Perfecto para playa o falda larga.',
    price: 42,
    stock: 14,
    imageProduct:
      'https://images.unsplash.com/photo-1582599926390-b4350d5dcd6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 8,
    category: categories[2],
    productName: 'Falda Maxi Bohemia',
    productDescription:
      'Falda maxi fluida en tela de rayon con estampado geometrico azteca, cintura elastica y dobladillo asimetrico.',
    price: 65,
    stock: 18,
    imageProduct:
      'https://images.unsplash.com/photo-1768033976461-61ea7527ac1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 9,
    category: categories[2],
    productName: 'Pantalon Palazzo Lino',
    productDescription:
      'Pantalon palazzo de lino natural en color arena. Corte amplio, cintura alta y bolsillos laterales.',
    price: 72,
    stock: 10,
    imageProduct:
      'https://images.unsplash.com/photo-1549412522-c8a0a5211846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 10,
    category: categories[3],
    productName: 'Set Pulseras Artesanales',
    productDescription:
      'Set de pulseras artesanales con piedras semipreciosas, cuentas de madera y macrame.',
    price: 32,
    stock: 35,
    imageProduct:
      'https://images.unsplash.com/photo-1766560360636-69204af3c947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 11,
    category: categories[3],
    productName: 'Collar Piedras Naturales',
    productDescription:
      'Collar largo con turquesa, ambar y cuarzo rosa enhebrados en hilo encerado.',
    price: 45,
    stock: 28,
    imageProduct:
      'https://images.unsplash.com/photo-1710552516885-92638d42a686?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    idProduct: 12,
    category: categories[4],
    productName: 'Kimono Floral de Seda',
    productDescription:
      'Kimono largo en tela satinada con estampado floral en tonos burdeos, verdes y dorados.',
    price: 98,
    stock: 9,
    imageProduct:
      'https://images.unsplash.com/photo-1773335954232-957e8945827e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
]

export const normalizeProduct = (product, index = 0) => ({
  idProduct: product.idProduct ?? product.id ?? index + 1,
  productName: product.productName ?? product.name ?? 'Producto sin nombre',
  category:
    typeof product.category === 'object'
      ? product.category
      : {
          idCategory: product.idCategory ?? index + 1,
          categoryName: product.categoryName ?? product.category ?? 'Coleccion',
        },
  productDescription:
    product.productDescription ??
    product.description ??
    'Prenda seleccionada para looks comodos, naturales y con identidad propia.',
  price: product.price ?? 0,
  stock: product.stock ?? product.quantity ?? 0,
  imageProduct: product.imageProduct ?? product.image ?? '',
})
