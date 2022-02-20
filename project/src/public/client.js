console.log(`insiiide`);
const originalState = {
    user: { name: "Udacity" },
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    // roverSol:{Curiosity:},
    selectedRover: undefined,
    showing: `root`,
}
const showingOpts = {
    missionDetails: `missionDetails`,
    latestPics: `latestPics`,
    // aboutRover: `aboutRover`,

}
const showingOptsDisplay = {
    latestPics: `Latest Images`,
    missionDetails: `Mission Details`,
    // aboutRover: `About Rover`,

}
const history = []; // states stored in history const to  enable nav
const HISTORY_DEPTH = 15; //how many backs

function getCurrentState() {
    return getHistory(history.length - 1);
}
function addtoHistory(prev, current) {
    console.log(`updating history`, prev, current);
    if (history.size == HISTORY_DEPTH) {
        history = history.splice(0, 1);
    }
    history.push(Object.assign({}, current));//new object added
    navigation(history.length - 1, true); //update nav page to latest index

}
/**
 * get a page from index, stored in persistent nav history
 * @param {*} index 
 * @returns 
 */
function getHistory(index) {
    if (history.length < index || index < 0) {
        console.log(`History Out Of Bounds`);
        return {};
    }
    return history[index];

}
/**
 * higher order fn for navigating, returns a function
 * @returns a navigation function with a hidden state
 */
function navigator() {
    let currPage = 0;
    return function (val, newPage) {
        if (newPage) {
            console.log(`new page navigation now ${val}`);
            currPage = val;
        }

        else {
            let temp = currPage + val;
            console.log(temp);
            if (temp < history.length && temp >= 0) {
                currPage += val;
                App(getHistory(currPage), true);
            }
        }

    }
}
//call oon back and fwd button
function goBack() {
    navigation(-1);

}
function goForward() {
    navigation(1);
}
const navigation = navigator();


const elements = document.getElementsByClassName("togglediv");
// add our markup to the page
const root = document.getElementById('root');
const roverPage = document.getElementById('rover');
const loading = document.getElementById('loading');
const greeting = document.getElementById('greeting');


// called every new page navigation except back buttons
const updateStore = (store, changes, fromNavigator) => {
    const changed = Object.assign({}, store, changes);//assign to new object, dont change others
    if (!fromNavigator)
        addtoHistory(store, changed);
    return changed;
}
/**
 * call after loading fnished, set relevant innerhtml vals
 */
const draw = (val) => {
    const state = getCurrentState();
    // console.log(`Calling Draw`, root, val, state);
    switch (state.showing) {
        case `root`:
            root.innerHTML = val;
            hideLoading(`root`);

            break;
        default:
            roverPage.innerHTML = val;
            hideLoading(`roverMain`);

            break;
    }
    // hideLoading(state.showing);


}
//show or hide loading div
function showLoading() {
    console.log(`showing load`);

    Array.from(elements).forEach(function (element) {
        if (element.id != `loading`) {
            element.style.display = `none`;
        } else {
            element.style.display = `block`;
        }
    });
}
function hideLoading(toShow) {
    console.log(`hiding load`, toShow);

    Array.from(elements).forEach(function (element) {
        if (element.id != toShow) {
            element.style.display = `none`;
        } else {
            console.log(element);
            element.style.display = `block`;
        }
    });
}
function setShowing(toSet) {
    App({ showing: toSet });
}
function buildRoverPageOpts() {
    return `<div class="row col-lg-12" style="display: inline; justify-content: space-between;">` + Object.keys(showingOpts).map(opt => {
        return ` <button class="btn btn-default" onclick="setShowing(&quot;${opt}&quot;)">${showingOptsDisplay[opt]}</button>`;

    }).join(`&nbsp&nbsp`) + `</div>`;
}

function selectRover(name) {
    console.log(`Rover Selected ${name}`)
    // showing = showingOpts.latestPics;//todo delete
    App({ selectedRover: name, showing: showingOpts.missionDetails });
}
function getRoverListButtons() {
    return originalState.rovers.map(rover => {
        return `
        <button  onclick="selectRover(&quot;${rover}&quot;)">${rover}</button>
      `;
    }).join(``);
}
function getRoversList() {
    return `<div class="row col-lg-12" style="display: inline; justify-content: space-between;  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);">
   <h3>Select A Rover To View Latest Images And Data</h3>
  
   `+ getRoverListButtons() + `</div>`;
}
function goHome() {
    App(originalState);
}
// create content
const App = (state, fromNavigator) => {
    console.log(`loading with update`, state);
    showLoading();
    let currentState = updateStore(getCurrentState(), state, fromNavigator);//only update history if not navigator arrows
    let { rovers, selectedRover, showing } = currentState;
    greeting.innerHTML = Greeting(selectedRover);

    if (selectedRover) {
        getRoverPage(showing, selectedRover, draw);
        // roverPage
    }
    else {
        return getImageOfTheDay(`
        <main>
        ${getRoversList()}

           
            <section>
                <h3>Astronomy Picture Of The Day</h3>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                %%replace%%
            </section>
        </main>
        <footer></footer>
    `)
    }
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    App(originalState);
});
// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (selectedRover) => {
    // ${Greeting(originalState.user.name)}
    console.log(selectedRover);
    let l2 = (selectedRover != undefined ? `<div"> <h5>Viewing Rover: ${selectedRover}</h5> <div>` : ``);
    let name = originalState.user.name;
    if (name) {
        return `
            <h3>Welcome, ${name}!</h3>
        `+ l2;
    }

    return `
        <h1>Hello!</h1>
    `
}

// ------------------------------------------------------  API CALLS

// Removed circular calls, now draw once on return, updates when refreshed
const getImageOfTheDay = (textValue) => {
    let ret = ``;
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())//turn response to json
        .then(apod => {
            // check if the photo of the day is actually type video!
            if (apod.media_type === "video") {
                ret += `
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `
            } else {
                ret += `
            <img src="${apod.image.url}" height="350px" width="100%" /> 
            <p>${apod.image.explanation}</p>
        `;
            }
            textValue = textValue.replace(`%%replace%%`, ret);
            draw(textValue);

        })

    return undefined;
}
function constructDatedImage(dimg) {
    return `<div padding-right:3% style="display:block; width:20%;" >
        <img style="display:block;
        height: auto;
       width: 100%;
       " src="${dimg.img_src}" >
        <br>
        <span> ${dimg.earth_date}</span>
    
    </div>&nbsp; &nbsp; &nbsp;`;
}
function buildRoverImageDisplays(ret, datedImages) {
    console.log(datedImages);
    ret += `<div class ="row col-lg-12
    " style=" display: flex;
    margin: 5em;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    flex-wrap: wrap;">`;

    ret += datedImages.map(dm => constructDatedImage(dm)).join(``);

    ret += `</div>`;
    return ret;
}
function buildRoverDetailsDisplay(ret, displayObj) {
    
    ret+= `<div style ="text-align: center;
   ">`;
    
    ret += Object.keys(displayObj).map(head=>{
        return `<h5><b>${head.replace(`_`,` `).toUpperCase()}</b>: ${displayObj[head]}   </h5>`
    }).join(``);
    
    ret += `</div>`;
    return ret;
}
/**
 * now a higher order function, takes a functio argument
 * @param {*} showing 
 * @param {*} selectedRover 
 * @param {*} doDraw 
 * @returns 
 */
function getRoverPage(showing, selectedRover, doDraw) {
    let ret = buildRoverPageOpts();
    console.log(`showww`, showing);
    switch (showing) {
        case showingOpts.latestPics:
            fetch(`http://localhost:3000/rover/latestPics?selectedRover=${selectedRover}`)
                .then(res => res.json())//turn response to json
                .then(datedImages => {

                    ret = buildRoverImageDisplays(ret, datedImages.images);

                    doDraw(ret);

                })
            break;
        case showingOpts.missionDetails:
            fetch(`http://localhost:3000/rover/missionDetails?selectedRover=${selectedRover}`)
                .then(res => res.json())//turn response to json
                .then(detailsObject => {
                    console.log(`details objetc`, detailsObject);
                    ret = buildRoverDetailsDisplay(ret, detailsObject);

                    doDraw(ret);

                })

            break;

    }
    return undefined;
}
