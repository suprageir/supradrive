export type Item = {
  name: string;
  slug: string;
  description?: string;
};

export const menu: { name: string; items: Item[] }[] = [
  {
    name: 'Encrypted',
    items: [
      {
        name: 'Textfiles',
        slug: 'encrypted/textfiles', 
        description: 'Encrypted textfiles',
      },
      {
        name: 'Images',
        slug: 'encrypted/images',
        description: 'Encrypted images',
      },
      {
        name: 'Videos',
        slug: 'encrypted/videos',
        description: 'Encrypted videos',
      },
    ],
  },
  {
    name: 'Files',
    items: [
      {
        name: 'Images',
        slug: 'images',
        description:
          'Images',
      },
    ],
  },
];
