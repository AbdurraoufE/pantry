'use client'
import React, { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from "@mui/material";
import { firestore } from '@/firebase';
import {collection, query, getDocs} from 'firebase/firestore';

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

  useEffect(() => {
    const updatePantry = async () => {
      const snapshot = query(collection(firestore, "pantry"))
      const docs = await getDocs(snapshot)
      const pantryList = [] // list of pantry items
      docs.forEach((doc) => {
        pantryList.push(doc.id) // adds the items from pantry
      })
      console.log(pantryList)
      setPantry(pantryList)
    }
    updatePantry();
  }, [])
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
            <TextField id = "outlined-basic" label="Item" variant="outlined" fullWidth />
            <Button variant="outlined">Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>Add Items</Button>
      <Box border={"1px solid #333"}>
      <Box
        width={"800px"}
        height={"100px"}
        bgcolor={"#b9e2f5"} // background color for pantry color
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
      > 
      <Typography
        variant={"h2"}
        color={"#232b2b"} // text color for pantry title
        textAlign={"center"}
      >Your Pantry
      </Typography>
      </Box>
      <Stack width="800px" height="300px" spacing={2} overflow={"auto"}>
        {pantry.map((item) => (
          <Box
            key={item}
            width="100%"
            minHeight="150px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor={"#edf7fc"} // background color for items list
          >
            <Typography
              variant={"h4"}
              color={"#333"}
              textAlign={"center"}        
            >
               {
                // capitalize first letter of item
                item.charAt(0).toUpperCase() + item.slice(1)
               }
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
    </Box>
  );
}
