// https://frozen-shelf-27437.herokuapp.com

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-akhil:Akhil_nair1@cluster0.xtoen.mongodb.net/todolistDB",{useNewUrlParser: true});

const itemsSchema={
  name: String
};

const Item= mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome to Todolist!"
});
const item2 = new Item({
  name:"Hit the + button to add a new item."
});
const item3 = new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];


app.get("/", function(req, res) {
  
  
  
  Item.find({},function(err,foundItems){
    
    if(foundItems.length ===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default items to database"); 
        }
      });

      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  })

  

});

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/:customListName",function(req,res){
  const customListName =  _.capitalize(req.params.customListName);
  

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle:foundList.name , newListItems:foundList.items});
      }
    }
  })

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  // console.log(listName)

  if(itemName.length === 0){
    if(listName === "Today"){
      res.redirect("/")
    }else{
      res.redirect("/"+listName);
    }
  }else{
    const item = new Item({
      name:itemName
    });

    if(listName === "Today"){
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name:listName},function(err,foundList){
        if(!err){
          if(foundList){
            foundList.items.push(item);
            foundList.save();
          }else{
            console.log("Empty");
          }
          res.redirect("/"+listName);
        }
      });
    }
  }
});


app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkBox;

  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        // console.log(checkedItemId);
        console.log("Succcefully deleted the marked item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

})


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port ==""){
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started Successfully");
});
