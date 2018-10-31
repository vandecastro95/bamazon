let inquirer = require("inquirer");
let mysql = require("mysql");
let Table = require("easy-table");

let connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "vsauce321",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id" + connection.threadId + "\n");

  readProducts();
});

function readProducts() {
  console.log("Selecting all products...\n");
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    //   console.log(res);

    let t = new Table();
    res.forEach(element => {
      t.cell("Product Id", element.item_id);
      t.cell("Description", element.product_name);
      t.cell("Price, USD", element.price, Table.number(2));
      t.newRow();
    });

    console.log(t.toString());
    promptCustomer(res);
  });
}

function promptCustomer(res) {
  setTimeout(() => {
    inquirer
      .prompt({
        name: "choice",
        type: "list",
        message: "Please input the ID of the product you would like to buy",
        choices: ["1", "2", "3", "3", "4", "5", "6", "7", "8", "9", "10"]
      })
      .then(function(answer) {
        res.forEach(element => {
          if (element.item_id.toString() === answer.choice) {
            let product = element.product_name;
            inquirer
              .prompt({
                name: "howmany",
                type: "input",
                message: "How many would you like to buy?"
              })
              .then(function(answer) {
                // console.log(element.stock_quantity);
                // console.log(answer.howmany);
                if (element.stock_quantity - answer.howmany >= 0) {
                  connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                      {
                        stock_quantity: element.stock_quantity - answer.howmany
                      },
                      {
                        product_name: element.product_name
                      }
                    ],
                    function(err, res2) {
                      if (err) throw err;
                      console.log("Products bought for $" + (element.price * answer.howmany));
                      connection.query("SELECT * FROM products WHERE ?", {
                        product_name: element.product_name
                      }, function(err3, res3) {
                        console.log("Stocks remaining: " + res3[0].stock_quantity)
                      })

                      connection.end();
                    }
                  );
                } else {
                  console.log("Insufficient quantity!");

                  connection.end();
                }
              });
          }
        });
      });
  }, 1500);
}
