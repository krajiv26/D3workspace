//Dom element selections

const btns = document.querySelectorAll('button');
const form = document.querySelector('form');
const formAct = document.querySelector('form span');
const input = document.querySelector('input');
const error = document.querySelector('.error');

var activity = 'cycling';

btns.forEach(btn => {
    btn.addEventListener('click', e => {
        //get activity
        activity = e.target.dataset.activity;
        //first remove active class and add active class
        btns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        // set id of input field dynamically
        input.setAttribute('id', activity);
        //set text of form span
        formAct.textContent = activity;

        // update activity call update function
        update(data);
    })
});


//form submit
form.addEventListener('submit', e => {
    //prevent default action
    e.preventDefault();
    const distance = parseInt(input.value);
    if(distance){
        db.collection('activities').add({
            // when key and value varaible of same name
            distance, //equivalant to distance: distance
            activity, //equivalant to activity: activity
            date: new Date().toString()
        }).then(() => {
            error.textContent = '';
            input.value = '';
        })
    } else {
        error.textContent = 'Please input a valid value';
    }
})