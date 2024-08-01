'use client'
import React, { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from "@mui/material";
import { firestore } from '@/firebase';
import {collection, query, doc, getDocs, setDoc, deleteDoc, getDoc} from 'firebase/firestore';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2
};

export default function Home() {
  const [pantry, setPantry] = useState([])
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPantry, setFilteredPantry] = useState([]);


  // update pantry function
  const updatePantry = async () => {
    const snapshot = query(collection(firestore, "pantry"))
    const docs = await getDocs(snapshot)
    const pantryList = [] // list of pantry items
    docs.forEach((doc) => {
      pantryList.push({name: doc.id, ...doc.data()}) // adds the items from pantry & quantaties
    })
    setPantry(pantryList)
    setFilteredPantry(pantryList); 
  }

  useEffect(() => {
    updatePantry();
  }, [])

  useEffect(() => {
    setFilteredPantry(
      pantry.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
}, [searchTerm, pantry]);

  // Function: handle the add item button
  const addItem = async (item) => {
    // connect to firebase server
    const docRef = doc(collection(firestore, "pantry"), item) // adds doc to pantry
    //check if we already have the item
    const docSnap = await getDoc(docRef)
    // adds quantity to pantry item if exists
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      await setDoc(docRef, {count: count + 1})
    } else {
      await setDoc(docRef, {count: 1})
    }
    await updatePantry()
  }

  // Function: handle the remove item button
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item)
    const docSnap = await getDoc(docRef)
    //deletes doc/item from pantry from its quantity
    if (docSnap.exists()){
      const {count} = docSnap.data()
      if (count === 1) {
        await deleteDoc(docRef)
      }else{
        await setDoc(docRef, {count: count -1})
      }
    }
    await updatePantry()
  }

  // Function: handles the search button
  const handleSearch = () => {
    console.log('Search term:', searchTerm);
    // checks if button is clicked with empty search bar
    if (searchTerm.trim() === ""){
      setFilteredPantry(pantry);
    }
    const searchResult = pantry.filter((item) => item.name.toLowerCase() === searchTerm.toLowerCase());
    setFilteredPantry(searchResult);
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection={"column"}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add an item
          </Typography>
          <Stack width="100%" direction={"row"} spacing={2}>
            <TextField 
            id = "outlined-basic" 
            label="Item" 
            variant="outlined" 
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            />
            <Button variant="outlined" 
            onClick={() => {
              addItem(itemName)
              setItemName("")
              handleClose()
            }}
            
            >Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>Add Items</Button>
      <TextField
        label="Search item"
        variant='outlined' 
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{marginBottom: 2}}
      />
      <Button variant="contained" onClick={handleSearch}>Search</Button>
      <Box border={"1px solid #333"}>
      <Box
        width={"800px"}
        height={"100px"}
        bgcolor={"#b9e2f5"} // background color for pantry color
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        paddingX={5}
      > 
      <Typography
        variant={"h2"}
        color={"#232b2b"} // text color for pantry title
        textAlign={"center"}
      >Your Pantry
      </Typography>
      </Box>
      <Stack width="800px" height="300px" spacing={2} overflow={"auto"}>
      {filteredPantry.map(({ name, count }) => ( // ISSUE HERE
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              bgcolor={"#edf7fc"} 
              paddingX={4} 
            >
              <Typography
                variant={"h4"}
                color={"#333"}
                textAlign={"center"}    
              >
                {
                  name.charAt(0).toUpperCase() + name.slice(1)
                }
              </Typography>
              <Typography
              variant='contained'
              color={"#333"}
              textAlign={"center"}
              > Quantity: {count}
              </Typography>
            <Button variant='contained' onClick={() => removeItem(name)}>Remove</Button>
          </Box>
        ))}
      </Stack>
    </Box>
  </Box>
  );
}
