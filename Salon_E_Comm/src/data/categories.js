export const categories = [
    {
        id: 'hair-care',
        name: 'Hair Care',
        sections: [
            {
                title: 'Products',
                items: [
                    { name: 'Shampoos', link: '/products?category=shampoo' },
                    { name: 'Conditioners', link: '/products?category=conditioner' },
                    { name: 'Hair Masks', link: '/products?category=hair-mask' },
                    { name: 'Oils & Serums', link: '/products?category=oil-serum' },
                    { name: 'Styling Gels', link: '/products?category=styling' }
                ]
            },
            {
                title: 'Hair Type',
                items: [
                    { name: 'Curly / Wavy', link: '/products?search=curly' },
                    { name: 'Dry / Damaged', link: '/products?search=damage' },
                    { name: 'Color Treated', link: '/products?category=color' },
                    { name: 'Fine / Thinning', link: '/products?search=volume' }
                ]
            }
        ]
    },
    {
        id: 'skin-care',
        name: 'Skin Care',
        sections: [
            {
                title: 'Face',
                items: [
                    { name: 'Cleansers', link: '/products?category=cleanser' },
                    { name: 'Moisturizers', link: '/products?category=moisturizer' },
                    { name: 'Serums', link: '/products?category=serum' },
                    { name: 'Sunscreen', link: '/products?category=sunscreen' }
                ]
            },
            {
                title: 'Body',
                items: [
                    { name: 'Body Lotions', link: '/products?category=lotion' },
                    { name: 'Body Wash', link: '/products?category=body-wash' },
                    { name: 'Scrub & Exfoliants', link: '/products?category=scrub' }
                ]
            }
        ]
    },
    {
        id: 'equipments',
        name: 'Equipments',
        sections: [
            {
                title: 'Electricals',
                items: [
                    { name: 'Hair Dryers', link: '/products?category=hair-dryer' },
                    { name: 'Straighteners', link: '/products?category=straightener' },
                    { name: 'Curlers', link: '/products?category=curler' },
                    { name: 'Trimmers', link: '/products?category=trimmer' }
                ]
            },
            {
                title: 'Salon Furniture',
                items: [
                    { name: 'Chairs', link: '/products?category=chair' },
                    { name: 'Mirrors', link: '/products?category=mirror' },
                    { name: 'Wash Units', link: '/products?category=wash-unit' }
                ]
            }
        ]
    },
    {
        id: 'tools',
        name: 'Tools',
        sections: [
            {
                title: 'Professional Tools',
                items: [
                    { name: 'Scissors', link: '/products?category=scissor' },
                    { name: 'Combs & Brushes', link: '/products?category=comb' },
                    { name: 'Clips & Accessories', link: '/products?category=accessory' },
                    { name: 'Capes & Aprons', link: '/products?category=cape' }
                ]
            }
        ]
    },
    {
        id: 'deals',
        name: 'Deals',
        link: '/products?search=deal',
        isDirectLink: true
    }
];
