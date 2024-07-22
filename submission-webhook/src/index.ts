import { PrismaClient } from "@prisma/client";
import express from "express";


const app = express();
app.use(express.json());

const prisma = new PrismaClient();

app.put("/submission", async (req, res) => {
  console.log("Received a submission!");
  console.log("req", req.body);
  const submission = req.body;
  await prisma.testCase.update({
    where:{
      token: submission.token,
    },
    data:{
      status_id: submission.status.id
    }
  })
  res.json(req.body);
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});

/*
Received a submission!
req {
  stdout: 'NQo=\n',
  time: '0.022',
  memory: 5036,
  stderr: null,
  token: '26a9537e-723e-4914-a684-10c341642fa3',
  compile_output: null,
  message: null,
  status: { id: 4, description: 'Wrong Answer' }
}
Received a submission!
req {
  stdout: 'NQo=\n',
  time: '0.024',
  memory: 6904,
  stderr: null,
  token: '97d0e026-fa71-4817-adb3-466cc9dd383b',
  compile_output: null,
  message: null,
  status: { id: 3, description: 'Accepted' }
}

*/