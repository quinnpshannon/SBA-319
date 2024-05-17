//Here is script for the HTML site
const main = document.getElementById('main')
const topNav = document.getElementById('topNav')

function mainListener(e){
}
function navListener(e){
    if(e.target.nodeName === 'LI'){
         console.log(`Click on ${e.target.id}!`)
    }
}

topNav.addEventListener('click',navListener);
main.addEventListener('click',mainListener);