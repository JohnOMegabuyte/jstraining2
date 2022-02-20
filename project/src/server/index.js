require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const Immutable = require('immutable')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))
let cache = Immutable.Map(); //store old queries for quick reply needs to be mutable to add values with immutable api


function updateCache(queryParam, jsonReply) {
    cache = cache.set(queryParam, jsonReply); //immutable cache replaced
}
function getCache(cachedName) {
    return cache.get(cachedName);
}

/**
 * name to store the response as, maxsol changes when new pics available
 * @param {} url 
 * @param {*} maxSol 
 */
function buildCacheName(url, maxSol) {
    return `${maxSol}_${url}`;
}


function addToImageArray(toAddFrom, arr) {
    toAddFrom.forEach(element => {
        if (arr.length < 25) {
            //only process element if it will be added
            arr.push({ img_src: element.img_src, earth_date: element.earth_date })
        }
    });
}
// your API calls

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rover/latestPics', async (req, res) => {
    // console.log(`req query`,req[`originalUrl`]);
    const roverName = req.query[`selectedRover`];
    try {
        const manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?api_key=${process.env.API_KEY}`)
            .then(res => res.json());
        // console.log(`manifest`, manifest);
        // console.log(`manifest`,manifest.photo_manifest.photos[0]);
        const maxSol = manifest.photo_manifest.max_sol; //store latest sol and cache accordingly
        const total = manifest.photo_manifest.total_photos;
        const cacheName = buildCacheName(req[`originalUrl`], maxSol);
        const photosArray = manifest.photo_manifest.photos;

        let images = getCache(cacheName); //array of image urls
        if (!images) {
            images = [];
            //if already cached return results else fetch 25 images and cache
            //get ~ 25 images for page using earth days from manifest
            let ArrInd = 0;
            while (images.length < 25 && images.length < total) {
                const next = photosArray[photosArray.length - 1 - ArrInd]; //get from latest pictures
                const date = next.earth_date;

                const imageTemp = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${date}&page=1&api_key=${process.env.API_KEY}`)
                    .then(res => res.json());
                addToImageArray(imageTemp.photos, images);

                ArrInd++;
            }
            // console.log(`full array`, images);
            updateCache(cacheName, images);

        }
        else {
            console.log(`got cached data`, images);
        }
        res.send({ images });
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rover/missionDetails', async (req, res) => {
    const roverName = req.query[`selectedRover`];
    try {
        const cacheName = buildCacheName(req[`originalUrl`], `undefined`);
        let dets = getCache(cacheName); //array of image urls
        if (!dets) {

            const manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?api_key=${process.env.API_KEY}`)
                .then(res => res.json());

            dets = { ...manifest.photo_manifest };
            delete dets.photos;
            // console.log(`full array`, dets);
            updateCache(cacheName, dets);

        }
        else {
            console.log(`got cached details`, dets);
        }
        res.send(dets);
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
    // listening for load event because page should load before any JS is called
    try {
        document.write("<script src='" + Immutable + "' data-main='/client.js'></script>");

    } catch (exception) {

    }

})