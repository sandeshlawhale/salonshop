export const categories = [
    {
        id: 'hair-care',
        name: 'Hair Care',
        sections: [
            {
                title: 'Products',
                items: [
                    { name: 'Shampoos', link: '/category/shampoos' },
                    { name: 'Conditioners', link: '/category/conditioners' },
                    { name: 'Hair Masks', link: '/category/hair-masks' },
                    { name: 'Oils & Serums', link: '/category/oils-serums' },
                    { name: 'Styling Gels', link: '/category/styling' }
                ]
            },
            {
                title: 'Hair Type',
                items: [
                    { name: 'Curly / Wavy', link: '/shop/curly-hair' },
                    { name: 'Dry / Damaged', link: '/shop/dry-hair' },
                    { name: 'Color Treated', link: '/shop/color-treated' },
                    { name: 'Fine / Thinning', link: '/shop/fine-hair' }
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
                    { name: 'Cleansers', link: '/category/cleansers' },
                    { name: 'Moisturizers', link: '/category/moisturizers' },
                    { name: 'Serums', link: '/category/serums' },
                    { name: 'Sunscreen', link: '/category/sunscreen' }
                ]
            },
            {
                title: 'Body',
                items: [
                    { name: 'Body Lotions', link: '/category/body-lotions' },
                    { name: 'Body Wash', link: '/category/body-wash' },
                    { name: 'Scrub & Exfoliants', link: '/category/body-scrub' }
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
                    { name: 'Hair Dryers', link: '/category/hair-dryers' },
                    { name: 'Straighteners', link: '/category/straighteners' },
                    { name: 'Curlers', link: '/category/curlers' },
                    { name: 'Trimmers', link: '/category/trimmers' }
                ]
            },
            {
                title: 'Salon Furniture',
                items: [
                    { name: 'Chairs', link: '/category/salon-chairs' },
                    { name: 'Mirrors', link: '/category/mirrors' },
                    { name: 'Wash Units', link: '/category/wash-units' }
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
                    { name: 'Scissors', link: '/category/scissors' },
                    { name: 'Combs & Brushes', link: '/category/combs' },
                    { name: 'Clips & Accessories', link: '/category/accessories' },
                    { name: 'Capes & Aprons', link: '/category/capes' }
                ]
            }
        ]
    },
    {
        id: 'deals',
        name: 'Deals',
        link: '/deals',
        isDirectLink: true
    }
];
