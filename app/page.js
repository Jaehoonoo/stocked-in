'use client' // client-sided app
import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Modal, Typography, Stack, TextField, Button } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, getDoc, query, setDoc } from 'firebase/firestore';

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList);
  }

  const handleDeleteDialogOpen = async () => {
    setDeleteDialogOpen(true);
  }

  const handleDeleteDialogClose = async () => {
    setDeleteDialogOpen(false);
  }

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);

    try {
      // Delete the document from the collection
      await deleteDoc(docRef);
      // Update the inventory list
      await updateInventory();
      // Close the delete dialog
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      if (quantity == 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {quantity: quantity - 1});
      }
    }

    await updateInventory();
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      await setDoc(docRef, {quantity: quantity + 1});
    }
    else {
      await setDoc(docRef, {quantity: 1});
    }

    await updateInventory();
  }

  useEffect(() => {
    updateInventory();
  }, [])

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box 
    width="100vw" 
    height="100vh" 
    display="flex" 
    flexDirection="column"
    justifyContent="center" 
    alignItems="center" 
    gap={2}
    >
      <Modal
      open={open}
      onClose={handleClose}
      >
        <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width={400}
        boxShadow={24}
        p={4}
        display="flex"
        flexDirection="column"
        gap={3}
        sx={{
          transform: 'translate(-50%, -50%)',
          bgcolor: "white",
          border: "2px solid black"
        }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
            variant='outlined'
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
            }}
            />
            <Button
            variant='outlined'
            onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
            >Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Button 
      variant="container"
      onClick={() => {
        handleOpen()
      }}
      sx={{bgcolor:"#2A5E21", color: "white"}}
      >
        Add New Item
      </Button>
      <Box border ='1px solid #333'>
        <Box
        width='800px'
        height="100px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{bgcolor: "#8BC34A", color: "white", hover: "#8BC34A"}}
        >
          <Typography variant="h2" color="#333">
            Inventory Items
          </Typography>
        </Box>
      <Stack width="800px" height="300px" spacing={2} overflow="auto">
        {
          inventory.map(({name, quantity}) => (
            <Box 
            key={name} 
            width="100%" 
            minHeight="150px" 
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgcolor="#f0f0f0"
            padding={5}
            >
              <Typography 
              variant="h3" 
              color = "#333" 
              textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)} 
              </Typography>
              <Stack direction="row" spacing={2}>
                <Typography 
                variant="h3" 
                color = "#333" 
                textAlign="center">
                  {quantity} 
                </Typography>
                <Button variant="contained" onClick={() => {
                  addItem(name)
                }}
                >Add</Button>

                {/* Delete confirmation Dialog */}
                <Button variant="contained" onClick={handleDeleteDialogOpen}
                >Delete</Button>

                <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
                  <DialogTitle>Confirm Delete</DialogTitle>
                  <DialogContent>
                    <Typography>Are you sure you want to delete this item?</Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleDeleteDialogClose} color="primary">No</Button>
                    <Button onClick={() => deleteItem(name)} color="secondary">Yes</Button>
                  </DialogActions>
                </Dialog>
              </Stack>
            </Box>
          ))
        }
      </Stack>
      </Box>
    </Box>
  )
}
