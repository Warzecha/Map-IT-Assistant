'use strict'


const {
    dialogflow,
    BrowseCarousel,
    Carousel,
    OptionItem,
    BrowseCarouselItem,
    Suggestions,
    Image
} = require('actions-on-google')
const functions = require('firebase-functions')
const app = dialogflow({ debug: true })


const a11yText = 'Google Assistant Bubbles';
const googleUrl = 'https://google.com';


// Handle the Dialogflow intent named 'Default Welcome Intent'.
// app.intent('Default Welcome Intent', (conv) => {



//     const userId = conv.user.raw.userId
//     console.log(userId)


//     conv.ask(new Permission({
//         context: 'Hi there, to know where you are',
//         permissions: 'DEVICE_PRECISE_LOCATION'
//       }));

//     // const locationPermission = app.SupportedPermissions.DEVICE_PRECISE_LOCATION
//     // app.askForPermissions('To tell you about this location', [locationPermission]);


//    });

app.intent('Default Welcome Intent', (conv) =>{
    conv.ask('Hi')
    conv.ask(new Suggestions(['What is nearby?', 'What is around me?']))
})

app.intent('POI', (conv) => {


    const location = {
        lng: 51.507044,
        lat: -0.074351
    }
    console.log(location)


    // axios
    // .get('nasz endpoint')
    // .then((res) => {

    //     console.log(res)

    // })
    // .catch((err) => {
    //     console.log(err.message)

    // }) 

    let res = [
        { name: 'Big Ben', lat: 51.500502, lng: -0.124862, url: 'https://media-cdn.tripadvisor.com/media/photo-s/08/dd/25/05/big-ben.jpg' },
        { name: 'Westminster station', lat: 51.50003, lng: -0.124862, url: 'https://media-cdn.tripadvisor.com/media/photo-s/08/dd/25/05/big-ben.jpg' },
        { name: 'Statue of Winston Churchil', lat: 51.50005, lng: -0.124862, url: 'https://media-cdn.tripadvisor.com/media/photo-s/08/dd/25/05/big-ben.jpg' }]


    let items = []


    res.forEach((el) => {
        items.push(new OptionItem({
            optionInfo: el.name,
            title: el.name,
            url: 'https://www.google.com/',
            description: 'lfsdfs fsjkfjs jfdkslfjdsk jfdskj klfjsklfjdsfdsklfjs.',
            image: new Image({
                url: el.url,
                alt: 'Image'
            })
        })
        )
    }
    )


    console.log(items)

    conv.ask('Here are the places nearby')
    conv.ask(new Carousel({
        items: items
    }))




    // conv.ask(new Carousel({
    //     items: [
    //       new BrowseCarouselItem({
    //         title: 'Title of item 1',
    //         url: googleUrl,
    //         description: 'Description of item 1',
    //         image: new Image({
    //           url: 'https://media-cdn.tripadvisor.com/media/photo-s/08/dd/25/05/big-ben.jpg',
    //           alt: a11yText,
    //         }),
    //         footer: 'Item 1 footer',
    //       }),
    //       new BrowseCarouselItem({
    //         title: 'Title of item 2',
    //         url: googleUrl,
    //         description: 'Description of item 2',
    //         image: new Image({
    //           url: 'https://media-cdn.tripadvisor.com/media/photo-s/08/dd/25/05/big-ben.jpg',
    //           alt: a11yText,
    //         }),
    //         footer: 'Item 2 footer',
    //       }),
    //     ],
    //   }));




    conv.close('BAJUBAJU')


});





exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app)