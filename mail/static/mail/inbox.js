document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.getElementById('compose-form').addEventListener('submit', (event) => send_mail(event));

    // By default, load the inbox
    load_mailbox('inbox'); 
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function send_mail(event){
    event.preventDefault();

    //API ROUTE
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: document.querySelector('#compose-recipients').value,
            subject:document.querySelector('#compose-subject').value,
            body: document.querySelector('#compose-body').value,
        })
    })
    .then(response => response.json())
    .then(result => {
            load_mailbox('sent');
        });
    // flase return allows for load_mailbox('sent');
    return false;
}


function archive(email) {

    let archivebtn = document.createElement('button');
        archivebtn.className = 'btn btn-sm btn-outline-primary';
        archivebtn.style ='margin-top: 3px;';
        archivebtn.id = `btn${email['id']}`;
        archivebtn.innerHTML = !email['archived'] ? 'Archive' : 'Unarchive';
        archivebtn.addEventListener('click', function() {
            fetch('/emails/' + email['id'], {
                method: "PUT",
                body: JSON.stringify({
                    archived : !email['archived']
                })
            })
            .then(response => load_mailbox('inbox'))
            });
        return archivebtn
}


function load_mailbox(mailbox) {
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    
    // Show the mailbox name
    let emails_view = document.querySelector('#emails-view');
    emails_view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    
    //Use API to recieve list of emails
    fetch('/emails/' + mailbox)
    .then(response => response.json())
    .then(emails => {
        
        //create new element for each email in mailbox
        emails.forEach(email => {
            let div = document.createElement('div');
            
            div.className = email['read'] ? "email-list-item-read" : "email-list-item-unread";
            div.id = `div${email['id']}`;
            div.innerHTML = `
            <span class="sender col-3"><b>${email['sender']}</b></span>
            <span class="subject col-6">Subject: ${email['subject']}</span>
            <span class="timestamp col-3">${email['timestamp']}</span>
            `;
            
            //append to DOM
            emails_view.appendChild(div);
            //enable the onclick for div to load single mail
            document.getElementById(`div${email['id']}`).addEventListener('click', () => load_email(email['id']));
        })
    });
}

function load_email(id) {
    fetch('/emails/' + id)
    .then(response => response.json())
    .then(email => {
        // Show the mailbox and hide other views
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#email-view').style.display = 'block';
        document.querySelector('#compose-view').style.display = 'none';

        //check to see if has been read is true
        if (!email['read']) {
            fetch('/emails/' + id, {
                method: 'PUT',
                body: JSON.stringify({
                    read : true
                })
            })
        }

        const email_view = document.getElementById('email-view');
        email_view.innerHTML = `
        <ul class="list-group">
            <li class="list-group-item">
                <div class="d-flex flex-row justify-content-between"">
                    <span class=""><b>From:</b> ${email['sender']}</span>
                    <span class=""><small>${email['timestamp']}</small></span>
                </div>
                <span>To: ${email['recipients']}</span>
            </li>
            <li class="list-group-item">
                <p class="text-center"><b>${email['subject']}</b><hr></p>
                <p class="text-center">${email['body']}</p>
            </li>  
        </ul>
        `;

        let replybtn = document.createElement('button');
        replybtn.className = 'btn btn-sm btn-outline-primary';
        replybtn.id = 'replybtn';
        replybtn.innerHTML = 'Reply';
        replybtn.style ='margin-left: 3px; margin-top: 3px';
        replybtn.addEventListener('click', function() {
            compose_email();

            // Pre fill fields with given information
            let reply_recipients = email['sender']
            document.querySelector("#compose-recipients").value = reply_recipients; 

            let reply_subject = email['subject'];
            //check that subject prefix is not repeated
            let re = reply_subject.split(" ", 1)[0];
            if (re === "Re:") {
                document.querySelector('#compose-subject').value = reply_subject;
            } else{
                document.querySelector('#compose-subject').value = "Re: " + reply_subject;
            }

            let reply_body = `
                On ${email['timestamp']}, ${email['sender']} wrote: ${email['body']}\n
                `;
            document.querySelector('#compose-body').value = reply_body;
        });

        let archivebtn = archive(email);
        email_view.appendChild(archivebtn)
        email_view.appendChild(replybtn)
    })
}