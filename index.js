const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post("/person/getDataByBirthDate", (req, res) => {
  const { birthDate } = req.body;

  if (!birthDate || !birthDate.dateFrom || !birthDate.dateTo) {
    return res.status(400).json({
      Status: "400",
      Message: "Bad Request: Missing required parameters",
    });
  }

  fetchDataByBirthDate(birthDate.dateFrom, birthDate.dateTo)
    .then((data) => {
      res.status(200).json({
        List: data,
        Status: "200",
        Message: "OK",
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({
        Status: "500",
        Message: "Internal server error",
      });
    });
});

const fetchDataByBirthDate = (dateFrom, dateTo) => {
  return new Promise((resolve, reject) => {
    const data = [
      { id: 1, fullName: "John Doe", birthdate: "2000-01-15" },
      { id: 2, fullName: "Jane Doe", birthdate: "2000-05-20" },
    ];

    const filteredData = data.filter(
      (person) => person.birthdate >= dateFrom && person.birthdate <= dateTo
    );

    resolve(filteredData);
  });
};

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
