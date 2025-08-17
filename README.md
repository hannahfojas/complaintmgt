
**Complaint Management System**

---

**About the System**

The Complaint Management system lets user register, track, and close customer complaints end-to-end. Its purpose is to make intake consistent and fast, keep each complaint’s details, and give teams clear visibility into what’s open vs. completed.

Users can create complaints via a validated form, view the latest complaints in a list, edit details as information changes, and update status through Open > In Progress > Resolved or Closed – No Resolution. A simple status filter helps focus the list, complaint age is calculated to highlight how long items have been active, and resolution notes can be captured when closing or resolving to document outcomes.


---
**Features**

Aside from the the User Management features of the system, the following features will be included in the CMS:

**Complaint Registration and Management**
* Register Complaints
* Update the Complaint Details
* View the list of Complaints
* Close Complaints without Resolution

**Complaint Resolution Monitoring**
* Update the Status
* Filter Complaints based on Status
* Compute and Display Age (Days)
* Resolution Note prompt


---
**Software Prerequisites and Installation**

* [Node.js](https://nodejs.org/en/download)
* [MongoDB](https://www.mongodb.com)
* [VS Code Editor](https://code.visualstudio.com)
* [Git](https://git-scm.com)

Please run the following commands in your command line.

Clone the Original Repository and change directory:
```bash
git clone https://github.com/hannahfojas/complaintmgt.git
cd complaintmgt
```


Install all dependecies:
```bash
npm run install-all
```

To start:
```bash
npm run dev
```


If you opt to do a live set up, you will also be needing these:
* [AWS EC2 Instance](https://aws.amazon.com/ec2/)
* Install PM2 
```bash
npm install -g pm2
```
* Install Nginx
```bash
 mkdir www
 cd www
 sudo apt-get install nginx
 sudo service nginx restart all
```

---
**Contact**

For any issues, you may contact me through email N11947462@qut.edu.au

