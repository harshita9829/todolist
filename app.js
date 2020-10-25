//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const app = express();
const _ = require('lodash');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true });
const itemsSchema = {
  name : String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item ({
    name : "Do Coding"
});
const item2 = new Item ({
    name : "Read Novels"
});
const item3 = new Item ({
    name : "Sketch"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};
const List = mongoose.model("List", listSchema);
app.get("/", function(req, res) {
Item.find({}, function(err, foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Inserted Successfully!");
      }
    });
    res.redirect("/");
  }else{
        console.log(foundItems);
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

})
// const day = date.getDate();
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list; //name paramter of the button

  const item = new Item ({
    name : itemName
  })
  if(listName === "Today"){
  item.save();
  res.redirect("/");}
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }
});

app.post("/delete", function(req,res){
  const itemName = req.body.checkbox;
  const listName = req.body.listName;
  // const convert = itemName("hexString");
  console.log(itemName);
  if(listName === "Today"){
    Item.findByIdAndRemove(itemName, function(err){
      if(!err){
          console.log("Successfully removed the done task");
          }
      res.redirect("/");
    });
  } else{
    List.findOneAndUpdate({name : listName},{$pull: {items: {_id: itemName}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
});

app.get("/:type", function(req,res){
  const customListName = _.capitalize(req.params.type);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        console.log("Doesn't exist");
        //Create a new list
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else{
        console.log("Exists");
        //Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
