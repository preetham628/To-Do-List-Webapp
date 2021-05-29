//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-preetham:Password9876@cluster0.09tbb.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true})

const itemsSchema = new mongoose.Schema({
  item:String
});

const Item = mongoose.model("Item",itemsSchema);

const Item1 = new Item({
  item:"Welcome to your todo-list"
})

const Item2 = new Item({
  item:"Click + to add new items to the list"
})

const Item3 = new Item({
  item:"<-- Hit this to delete the item"
})

const defaultItems = [Item1,Item2,Item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {
  Item.find(function(err,items){
    if(items.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Success");
        }
      })
    }
    res.render("list", {listTitle: "Today", newListItems: items});
  })


});

app.get("/:listName",function(req,res){
  const listName = _.capitalize(req.params.listName);

  List.findOne({name:listName},function(err,foundList){
    if(!foundList){
      //Create a new list
      const list = new List({
        name:listName,
        items:defaultItems
      });

      list.save();
      res.redirect("/"+listName)
    }else{
      //Show an existing list
      res.render("list",{listTitle:foundList.name ,newListItems:foundList.items})
    }
  })

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const NewItem = new Item({
    item:itemName
  });
  if(listName == "Today"){
    NewItem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err, foundItems){
      foundItems.items.push(NewItem);
      foundItems.save();

      res.redirect("/"+foundItems.name);
    })
  }
});

app.post("/delete",function(req,res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id:id},function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Deleted a record");
      }
    });
    res.redirect("/")
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

})


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
