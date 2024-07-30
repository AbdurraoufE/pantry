import { Box, Stack, Typography } from "@mui/material";

const items = [
  "tomato",
  "apple",
  "banana",
  "orange",
  "kiwi",
  "grapes",
  "mango",
  "lettuce",
  "pineapple",
  "dragonfruit",
  "carrots",
  "cucumber",
  "olives",
  "bellpepper"
];

export default function Home() {
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Stack width="800px" height="300px" spacing={2} overflow={"auto"}>
        {items.map((item) => (
          <Box
            key={item}
            width="100%"
            height="300px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor={"#D3D3D3"}
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
  );
}
