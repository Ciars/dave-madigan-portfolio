// Dynamic Image Import
// This automatically grabs all images from src/assets/artworks
const images = import.meta.glob('../assets/artworks/*.{png,jpg,jpeg,webp}', { eager: true });

console.log("Loaded images raw:", images);

// Convert the glob object into an array of image objects
export const galleryImages = Object.entries(images).map(([path, module], index) => {
    const fileName = path.split('/').pop().split('.')[0];
    return {
        id: index + 1,
        src: module.default || module, // Handle both ESM and CommonJS just in case
        title: fileName.replace(/-/g, ' ').replace(/_/g, ' ') || `Untitled ${index + 1}`,
        year: '2024',
        medium: 'Oil on Canvas'
    };
});
export const fallbackImages = galleryImages;

console.log("Processed galleryImages:", galleryImages);

export const bio = [
    "Following a career in manufacturing, Dave Madigan (b. Dublin, Ireland) retrained as a visual artist. He graduated in 2009 with a first class honours degree in Visual Arts Practice from the Institute of Art, Design and Technology.",
    "A regular exhibitor in the Royal Hibernian and Royal Ulster academies, Dave's work is noted for his surreal painted depictions of modern day technological artefacts which he places, always out of scale, in detailed landscapes. His paintings have been awarded for their lyrical, poetic and often humorous depictions and his accomplished technical application of oil paint.",
    "Most recently, Dave has moved toward studies of environmental subject matter. In this new body of work he considers an increasing remove from the natural that is a danger to urbanised populations. He inverts our sense of reality and the expected by the subtle use of illusion, distortion and by alluding to digital aesthetics in his new paintings of plant life."
];

export const currentExhibition = {
    title: "194th RHA Annual Show",
    location: "Royal Hibernian Academy, Ely Place, Dublin 2",
    dates: "May 20 — Aug 5, 2024",
    link: "#"
};

export const exhibitions = [
    { year: "2023", title: "Climate and Health Exhibition", location: "Royal College of Physicians of Ireland, IRL" },
    { year: "2023", title: "193rd RHA Annual Show", location: "Ely Place, Dublin 2, IRL" },
    { year: "2023", title: "Solo Show", location: "DLR LexIcon Municipal Gallery, Dún Laoghaire, Dublin, Ireland" },
    { year: "2022", title: "192nd RHA Annual Show", location: "Dublin, IRL" },
    { year: "2022", title: "141st RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2022", title: "Cairde Visual", location: "The Model, Sligo, IRL" },
    { year: "2021", title: "191st RHA Annual Show", location: "Dublin, IRL" },
    { year: "2021", title: "140th RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2020", title: "139th RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2020", title: "190th RHA Annual Show", location: "Dublin, IRL" },
    { year: "2019", title: "189th RHA Annual Show", location: "Dublin, IRL" },
    { year: "2019", title: "Vue Art Fair", location: "RHA, Dublin, IRL" },
    { year: "2019", title: "Cairde Visual", location: "The Model, Sligo, IRL" },
    { year: "2018", title: "188th RHA Annual Show", location: "Dublin, IRL" },
    { year: "2018", title: "137th RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2018", title: "RHA Gala Auction", location: "Dublin, IRL" },
    { year: "2017", title: "187th RHA Annual Show", location: "Dublin, IRL" },
    { year: "2017", title: "136th RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2016", title: "186th RHA Annual Show", location: "Dublin, IRL" },
    { year: "2016", title: "135th RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2016", title: "RHA Gala Auction", location: "Dublin, IRL" },
    { year: "2015", title: "185th RHA Annual Show", location: "Dublin, IRL" },
    { year: "2015", title: "134th RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2014", title: "184th RHA Annual Show", location: "Dublin, IRL" },
    { year: "2014", title: "133rd RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2013", title: "183rd RHA Annual Show", location: "Dublin, IRL" },
    { year: "2013", title: "132nd RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2013", title: "RHA Gala Auction", location: "Dublin, IRL" },
    { year: "2012", title: "182nd RHA Annual Show", location: "Dublin, IRL" },
    { year: "2012", title: "131st RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2012", title: "RHA Gala Auction", location: "Dublin, IRL" },
    { year: "2011", title: "181st RHA Annual Show", location: "Dublin, IRL" },
    { year: "2011", title: "130th RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2010", title: "180th RHA Annual Show", location: "Dublin, IRL" },
    { year: "2010", title: "129th RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2010", title: "Éigse", location: "Carlow, IRL" },
    { year: "2009", title: "179th RHA Annual Show", location: "Dublin, IRL" },
    { year: "2009", title: "128th RUA Annual Show", location: "Belfast, N. Ireland" },
    { year: "2009", title: "IADT Graduate Show", location: "Dublin, IRL" }
];

export const collections = [
    "Office of Public Works",
    "DCU Business School",
    "The Arts Council of Northern Ireland",
    "Dún Laoghaire-Rathdown County Council",
    "Royal College of Physicians, Ireland"
];

export const contact = {
    email: "info@davemadigan.ie",
    studio: "Studio 9, The Model, Sligo, Ireland"
};
