# PeopleDoc

PeopleDoc API client.

## Instanciate client

```js
var peopleDoc = require('peopledoc')({
  uri: 'https://api.url.com/v1/',
  apiKey: "YOUR-API-KEY"
});
```

`peopledoc` instance provides a few models which consumes PeopleDoc API. 

Each Model embeds some static functions which are usable directly from the models and some methods wich are usable from the instances of the models. 
Both statics and methods handle promises and callback patterns.

Model properties depends on PeopleDoc official documentation. 

#### Example of statics:

```js
peopleDoc.Employee
  .findById('internal056')
  .then(function (user) {
    // user is an instance of peopleDoc.Employee or is undefined
  })
  .catch(function (err) {
    // err
  });

```

#### Example of methods:

```js
 var user = new peopleDoc.Employee({
   'lastname': 'MARTIN',
   'firstname': 'Paul',
   // ...
 });
 
 user
  .save()
  .then(function () {
    // ...
  })
  .catch(function (err) {
    // err
  });
```


### Employee
Consume Employee API.

#### Statics
- RegistrationReference: Model 
- findById: function (technical_id)
- register: function (technical_id, registration)
- unregister: function (technical_id, organization_code, registration_number)
- leave: function (technical_id)
- returns: returns(technical_id)

#### Methods
- save: function ()
- register: function (registration)
- unregister: function (registration)
- leave: function ()
- returns: function ()


### Document
Consume Document API.

#### Statics
- download: function (document_id)


#### Methods
- save: function (file)


### Signature
Consume Signature API.

#### Statics
- find: function (query)
- findById: function (id)


#### Methods
- send: function (file)


### Example

#### Saving a new user

```js
 var user = new peopleDoc.Employee({
   'lastname': 'MARTIN',
   'firstname': 'Paul',
   'email': 'mpaul@example.com',
   'technical_id': 'internal056',
   'registration_references': [
     {
       'organization_code': 'FSUD1',
       'registration_number': 'BYUIE5685678',
       'active': true
     },
     {
       'organization_code': 'FSUD2',
       'registration_number': 'BYUIE5685677',
       'active': false,
       'departure_date': '2014-12-31'
     }
   ]
   'dob': '1985-04-12',
   'address1': '34 rue du général',
   'zip_code': '75016',
   'city': 'Paris',
   'country': 'FR',
   'mobile_phone_number': '0033645764425',
   'filters': {
       'nh': '4',
       'title': 'directeur'
   }
 });
 
 user.save();
```

### Searching then registering a user
 
```js
 peopleDoc.Employee
   .findById('internal056')
   .then(function (user) {
     if (user) {
       return user.register({'organization_code': 'interim', 'registration_number': 'BYUIE5685678', 'active': true});
     }
   })
   .then(function () {
     // ...
   });
```

### Signing a document

```js
var signature = new peopleDoc.Signature({
  'external_id': '00000005',
  'signature_type': 'delegation',
  'document_type': 'contrat-de-travail',
  'document_type_metas': {
    'date-de-debut-de-contrat': '2016-08-16'
  },
  'title': 'Contrat de travail Paul',
  'reason': 'Contrat de travail CDD',
  'location': 'Paris',
  'requestor_description': 'Natalie Dupond',
  'expiration_date': '2016-07-14T19:20+01:00',
  'auto_archive': true,
  'callback_url': 'https://your-domain.com/signing_callback/',
  'signers':
    [
      {
        'type': 'employee',
        'technical_id': 'internal002',
        'email_address': 'jbdemonte@gmail.com',
        'phone_number': '0033626216032',
        'signing_order': 2,
        'pdf_sign_field': 'FIELD_1',
        'generate_pdf_sign_field': {
          'page': 1,
          'llx':250,
          'lly':100,
          'urx':350,
          'ury':150
        },
        'with_sms_notification': true,
        'with_sms_authentication': true
      }
    ]
});

signature.send('./document.pdf', function (err, result) {
  console.log(err, result)
});

```

signature.send also accepts a readable stream instead of the file path.

### Finding available signatures

```js
peopleDoc.Signature.find({}, function (err, result) {
  console.log(result.signatures);
});

peopleDoc.Signature.findById(2477, function (err, signature) {
  console.log(err, signature);
});
```

### Saving a document 

```js
var document = new peopleDoc.Document({
  'external_unique_id': "6789678GKVGHKVGHJM",
  'title': "Sample PDF",
  'document_type_code': "contrat-de-travail",
  'date': "2013-01-24",

  'document_type_metas': {'date-de-debut-de-contrat': "2016-07-30"},
  'employee_technical_id': "internal056",
  'organization_codes': ['FSUD1', 'FSUD2'],
  'api_uploader_name': "Mike Doug"
});


document.save('./sample.pdf', function (err, result) {
  console.log(err, result);
});

```

### Downloading a document 

```js
peopleDoc.Document.download('2084720', function (err, response) {
  if (!err) {
    require('fs').writeFile("./2084720.pdf", response.body);
  }
});

```