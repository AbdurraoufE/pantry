'use client'
import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from "@mui/material";
import { firestore } from '@/firebase';
import {collection, query, getDocs} from 'firebase/firestore';

export default function Home() {
  const [pantry, setPantry] = useState([])
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
    >
      <Box border={"1px solid #333"}
      >
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
            height="300px"
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
