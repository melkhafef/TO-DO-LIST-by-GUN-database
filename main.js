// Declare gun and thier peers we use one peer but you can use array of peers
let gun = Gun('https://gunjs.herokuapp.com/gun');
// Declare gun user
let user = gun.user();
// Define variables for number of tasks and done tasks
let tasks = 0;
let tasksDone = 0;
// make date of recent day as default input
let date = new Date();
let day;
let month;
if (date.getDate().toString().length == 1) {
    day = '0' + date.getDate().toString();
}
else {
    day = date.getDate().toString();
}
if ((date.getMonth() + 1).toString().length == 1) {
    month = '0' + (date.getMonth() + 1).toString();
}
else {
    month = (date.getMonth() + 1).toString();
}
$('#dates').val(`${date.getFullYear()}-${month}-${day}`);
//un comment the next line if you want user still sign in until after refresh
//user.recall({ sessionStorage: true });
// when click sign up create a gun user
$('#up').on('click', function (e) {
    e.preventDefault()
    user.create($('#alias').val(), $('#pass').val());
})
// when click sign in test if username and password are correct
$('#sign').on('submit', function (e) {
    e.preventDefault()
    user.auth($('#alias').val(), $('#pass').val());
})
// when click add button to add task create new graph (table) and add the input to it then clear the input
$('#add').on('submit', function (e) {
    e.preventDefault()
    if (!user.is) { return; }
    user.get($('#dates').val()).set($('#todo').val());
    $('#todo').val("");
})
//core function
let getData = function () {
    // enable the inputs after sign in
    $('#dates').prop('disabled', false);
    $('#todo').prop('disabled', false);
    $('#add input[type="submit"]').prop('disabled', false);
    // hide sign form
    $('#sign').hide();
    // clear ul childern elements
    $('ul').html('');
    // reset number of tasks and done tasks
    tasks = 0;
    tasksDone = 0;
    $('#numOfTasks').html(tasks.toString())
    $('#numOfDoneTasks').html(tasksDone.toString())
    // apply the next function on all graph (table) element for one time only to calculate number of tasks
    user.get($('#dates').val()).map().once(function (todo, id) {
        let li = $('#' + id).get(0) || $('<li>').attr('id', id).appendTo('ul');
        if (todo == null) {
            $(li).remove();
        }
        else {
            tasks++;

            $('#numOfTasks').html(tasks.toString())
        }
    })
    /*
     apply the next function on all graph (table) element continuously to 
     calculate number of done tasks
     add the elements to html
    */
    user.get($('#dates').val()).map().on(function (todo, id) {
        let li = $('#' + id).get(0) || $('<li>').attr('id', id).appendTo('ul');
        if (todo == null) {
            $(li).remove();
        }
        else {

            let tododone = todo;
            tododone = tododone.split(" ")
            if (tododone[tododone.length - 1] == "Done") {
                tasksDone++
                $('#numOfDoneTasks').html(tasksDone.toString())
                $(li).html(`<span style="color:green">${todo}</span> `)
            }
            else {
                $(li).html(`<input type='checkbox' onclick="clickCheck(this)">
         <span onclick="clickTitle(this)">${todo}</span>
         <img onclick="clickDelete(this)" width=10px src="https://cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/svgs/fi-x.svg"/> `)
            }
        }
    })
}
// apply getData function continuously when sign in correctly
gun.on('auth', getData)
// apply getData function  when you change the date
$('#dates').on('change', getData)
// when you click the task title becomes input to replace its value  and click Enter to save
function clickTitle(element) {
    console.log('hjhkhk');
    element = $(element)
    if (!element.find('input').get(0)) {
        element.html('<input value="' + element.html() + '" onkeyup="keypressTitle(this)">')
    }
}

function keypressTitle(element) {

    if (event.keyCode === 13) {

        user.get($('#dates').val()).get($(element).parent().parent().attr('id')).put($(element).val());
    }
}
// when click on checkbox for done tasks add Done word and remove checkbox input
function clickCheck(element) {
    user.get($('#dates').val()).get($(element).parent().attr('id')).put($('#' + $(element).parent().attr('id')).children()[1].innerText + " " + 'Done')
    $(element).remove();
}
// when click on (x) delete task from graph (table) 
function clickDelete(element) {
    user.get($('#dates').val()).get($(element).parent().attr('id')).put(null)
    tasks--;
    $('#numOfTasks').html(tasks.toString())
}