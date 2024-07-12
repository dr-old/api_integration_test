
# Api Integration Test

This is step for integration for fetch data from server

## Installation

```
git clone https://github.com/dr-old/api_integration_test.git
```
If using `npm`
```
cd api_integration_test && npm install && node index.js
```
If using `yarn`
```
cd api_integration_test && yarn && node index.js
```

## API Reference

#### Fetch all items filter by dateFrom and dateTo

```http
  POST /person/getDataByBirthDate
```
Body using JSON format

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `dateFrom` | `string` | **Required**. Your date from YYYY-MM-DD |
| `dateTo` | `string` | **Required**. Your date to YYYY-MM-DD |


