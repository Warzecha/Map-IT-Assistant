'use strict'

const {
    dialogflow,
    BrowseCarousel,
    BasicCard,
    BrowseCarouselItem,
    Suggestions,
    SimpleResponse,
    Button,
    Image
} = require('actions-on-google')
const functions = require('firebase-functions')
const app = dialogflow({ debug: true })
const axios = require('axios')



const baseURL = 'https://helpful-henry.herokuapp.com'
const parisURL = 'https://data.ratp.fr/api/records/1.0/search/?dataset=accessibilite-des-gares-et-stations-metro-et-rer-ratp&rows=170&sort=paqt&facet=paqt&refine.paqt=1'


app.intent('Default Welcome Intent', (conv) => {
    // if (conv.user.last.seen) {
    //     conv.ask(`Hey, welcome back! Last time you've visited ____. What is your opinion on accessibility of that place?`)
    //     conv.ask(new Suggestions(['1','2','3','4','5']))


    //   } else {
        conv.ask('Hi, I am helpful Henry, how can I assist you?')
        conv.ask(new Suggestions(['What is around me?', 'Accessible metro']))
    //   }

    
    

})

app.intent('POI', (conv) => {


    let location = {
        lat: 48.864716,
        lng: 2.349014
    }

    console.log('location', location)


    return axios
        .get(baseURL + '/places', { data: { categories: ['sights-museums'], location: location } })
        .then((res) => {

            // console.log('RES DATA:' ,res.data)

            let items = []

            let voiceResponse = 'The places nearby are '

            let prefix = ''

            let places_titles = []

            res.data.forEach((el) => {
                items.push(new BrowseCarouselItem({
                    title: el.title,
                    url: 'https://www.google.com/',
                    description: el.description,
                    image: new Image({
                        url: el.imgUrl,
                        alt: 'Image'
                    })
                })
                )
                places_titles.push(el.title)

                voiceResponse += prefix + el.title
                prefix = ', '

            })


            conv.ask(new Suggestions(places_titles))

            conv.ask(voiceResponse)
            conv.ask(new BrowseCarousel({
                items: items
            }))


            conv.ask('Are you interested in any of them?');

            const contextParameters = {
                loc: location,
                places: res.data
            };

            conv.contexts.set('context2', 5, contextParameters);

        })
        .catch((err) => {
            console.log(err)

        })
});


app.intent('POI - custom', (conv, params) => {

    const context2 = conv.contexts.get('context2')

    console.log(params['place-attraction'])

    let place_lat = 0
    let place_lng = 0
    let description = ''

    let valid_place = false
    context2.parameters.places.forEach((el) => {
        if (params['place-attraction'] == el.title) {
            valid_place = true
            place_lat = (el.location[0])
            place_lng = (el.location[1])
            description = el.description
        }
    })

    // console.log(params)
    if (valid_place) {
        conv.ask(new SimpleResponse({
            speech: `Here are some facts about ${params['place-attraction']}. ${description}`,
        }))
        
        

        const contextParameters = {
            name: params['place-attraction'],
            place_lat: place_lat,
            place_lng: place_lng

        };

        conv.contexts.set('context1', 5, contextParameters);


        conv.ask(`Would you like me to show ${params['place-attraction']} on the map?`)
    }
    else {
        conv.ask(`Please tell me one of listed places.`)
    }

})

app.intent('POI - custom - yes', (conv) => {

    const context1 = conv.contexts.get('context1')
    conv.ask(`Here is ${context1.parameters.name} on the map.`)



    const context2 = conv.contexts.get('context2')


    let destination = {
        lat: context1.parameters.place_lat,
        lng: context1.parameters.place_lng
    }
    console.log('dest', destination)
    
    let location = {
        lat: context2.parameters.loc.lat,
        lng: context2.parameters.loc.lng
        
    }
    
    console.log('location', location)
   
    let mapUrl = `https://image.maps.api.here.com/mia/1.6/routing?app_id=9SIjMZAXcgvnkxer3xmF&app_code=TTxSTcc9tPU5AboGJgaI6Q&waypoint0=${location.lat},${location.lng}&waypoint1=${destination.lat},${destination.lng}&poix0=${location.lat},${location.lng};00a3f2;00a3f2;11;.&poix1=${destination.lat},${destination.lng};white;white;11;.&lc=1652B4&lw=6&t=0&ppi=320&w=400&h=200`

    console.log(mapUrl)



    conv.ask(new BasicCard({
        title: `${context1.parameters.name}`,
        buttons: new Button({
          title: 'Interactive map',
          url: `https://krzeelzb.github.io/helpful-henry-map/?sLat=${context2.parameters.loc.lat}&sLng=${context2.parameters.loc.lng}&dLat=${destination.lat}&dLng=${destination.lng}`,
        }),
        image: new Image({
            url: mapUrl,
            alt: 'Image alternate text',
        }),
        display: 'CROPPED',
    }));

    

    const contextParameters = {
        location: location,
        destination: destination
    };

    conv.contexts.set('context5', 5, contextParameters)


    conv.ask('Would you like me to navigate you via voice?')

})


app.intent('accessibleTrains', (conv) => {

    let location = {
        lat: 48.864716,
        lng: 2.349014
    }


    return axios
        .get(parisURL)
        .then((res) => {
            
            let nearest = res.data.records[0]
            let shortest_dist = Math.sqrt(Math.pow((location.lat - res.data.records[0].fields.coord[0]), 2) + Math.pow((location.lng - res.data.records[0].fields.coord[1]),2))
            res.data.records.forEach((el) => {
                const dist = Math.sqrt(Math.pow((location.lat - el.fields.coord[0]), 2) + Math.pow((location.lng - el.fields.coord[1]),2)) 
                if (dist < shortest_dist){
                    shortest_dist = dist
                    nearest = el
                }
            })
            let message = 'The nearest accessible metro station is ' + nearest.fields.nomptar
            conv.ask(message)
            conv.ask('Do you want me to show it on a map?')

            const contextParameters = {
                location: location,
                nearest: nearest
            };

            conv.contexts.set('context3', 5, contextParameters)

        })
        .catch((e) =>{
            console.log(e.message)
        })


})

app.intent('accessibleTrains - yes', (conv) => {
    const context3 = conv.contexts.get('context3')

    console.log(context3.parameters.nearest.fields)

    conv.ask(`Here is ${context3.parameters.nearest.fields.nomptar} on the map.`)


    let location = {
        lat: context3.parameters.location.lat,
        lng: context3.parameters.location.lng
    }

    let destination = {
        lat: (context3.parameters.nearest.fields.coord[0]),
        lng: (context3.parameters.nearest.fields.coord[1])
    }

    console.log('location', location, 'destination', destination)
    
    
    let mapUrl = `https://image.maps.api.here.com/mia/1.6/routing?app_id=9SIjMZAXcgvnkxer3xmF&app_code=TTxSTcc9tPU5AboGJgaI6Q&waypoint0=${location.lat},${location.lng}&waypoint1=${destination.lat},${destination.lng}&poix0=${location.lat},${location.lng};00a3f2;00a3f2;11;.&poix1=${destination.lat},${destination.lng};white;white;11;.&lc=1652B4&lw=6&t=0&ppi=320&w=400&h=200`
    console.log(mapUrl)



    conv.ask(new BasicCard({
        title: `${context3.parameters.nearest.fields.nomptar}`,
        buttons: new Button({
            title: 'Interactive map',
            url: `https://krzeelzb.github.io/helpful-henry-map/?sLat=${location.lat}&sLng=${location.lng}&dLat=${destination.lat}&dLng=${destination.lng}`,
        }),
        image: new Image({
            url: mapUrl,
            alt: 'Image alternate text',
        }),
        display: 'CROPPED',
    }));



    const contextParameters = {
        location: location,
        destination: destination
    };

    conv.contexts.set('context4', 5, contextParameters)


    conv.ask('Would you like me to navigate you via voice?')
})


app.intent('POI - custom - yes - yes', (conv) => {


    const context5 = conv.contexts.get('context5')
    console.log(context5.parameters)
    conv.ask('I will navigate you')

    let obj = {location: context5.parameters.location, destination: context5.parameters.destination }

    console.log('object', obj)

    return axios
    .get(baseURL + `/instructions`,{data: obj })
    .then((res) => {

        console.log(res.data)

        const navigation = res.data.join('\n')
        conv.close(navigation)

    })
    .catch((err) => {

    })


})


app.intent('accessibleTrains - yes - yes', (conv) => {

    const context4 = conv.contexts.get('context4')
    console.log(context4.parameters)

    let obj = {location: context4.parameters.location, destination: context4.parameters.destination }

    console.log('object', obj)

    conv.ask('I will navigate you')
    return axios
    .get(baseURL + `/instructions`,{data: obj} )
    .then((res) => {
        const navigation = res.data.join('\n')
        conv.close(navigation)
    })
    .catch((err) => {

    })

})



exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app)