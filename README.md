> This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

# Application Tarefas+

**"Tarefas+"** (Tasks) is a simple web application where you control your tasks, you can create and delete tasks, and, maybe if you want, make them public, so you can share it with your friends, public tasks are available to receive comments from others (and yourself).

## Construction process

There are three pages in the application, [`<Homepage />`](#homepage),
[`<Dashboard />`](#dashboard) and [`<Task />`](#task), the task page is a dynamic route,
which means it's route will take an argument to know which task to render, 
the identificator for it is the `taskId`. Components like [`<Header />`](#header)
and [`<Textarea />`](#textarea) are very useful in the application.

## Pages

### Homepage
The main page shows two cards revealing how many posts and comments the 
application already has. The information of so, is get via `getStaticProps`
from Next, since this information isn't critical to be fresh all the time,
it has a `revalidate` time os 120 seconds (2 minutes). This is a great
implementation of so because the main page will be static for the next users
that acess it (disconsidering the user that will trigger the revalidation).


### Dashboard

The dashboard is where you can create your tasks (or delete the already 
done ones), there are two inputs, a Textarea (which is a separated component)
and a checkbox to mark the task as public or not. In the bottom of the page 
there will be a list of all the tasks you own. If they were created as 
public, there will be a share button above it, which will copy it's link 
to your clipboard.

In the dashboard we need to use the connection to the firebase database,
by using an `useEffect` in the body of the function, we stablish a
snapshot connection, which listens to changes in the collection `'tarefas'`
in the database, so whenever you add a new task, it will be sent to the
database and shown in the list of tasks.


### Task

In the `Task` page we will need an information passed through the URL,
we will get it with `/task/[id]`, that represents the `taskId` in the 
database. With that, we will need `getServerSideProps`, because we can
get the task and all of it's information. If it's public we will be able
to get all of it's comments before loading the component in the screen,
making all the computation on the server.

About comments, it's possible to add new comments and delete them, but you
can only delete your own comments, there's another conditional rendering,
deciding to or not render "delete button".

## Components

### Header

The component `<Header />` is present in all pages, but it's button 
"Meu painel" (My dashboard) is only visible for logged in users, 
so there's a conditional rendering. It's login button acts like a toggle, 
makes you log out if you are already logged, and vice versa.

### Textarea

The reason to create a `<Textarea />` component is that in both [Dashboard](#dashboard)
and [Task](#task) it appears, for Dashboard it's the new task input, for Task
it's the new comment input.


### Technologies applied
- [NextJS](https://nextjs.org/docs) (with typescript) - For pagination, server side rendering and static page generation
- [ReactJS](https://react.dev/reference/react) (with typescript) - For reactivity in the client and consume of REST API's
- [NextAuth](https://next-auth.js.org/getting-started/introduction) - For authentication with GoogleProvider
- [CSS Modules](https://nextjs.org/docs/13/app/building-your-application/styling/css-modules) (integrated with NextJS) - For easier and scoped stylization of the pages and components
- [Firebase Database](https://firebase.google.com/docs?hl=en) - To register the tasks and register the comments on public tasks.

## Running the project and .env variables

If you want to run this project, first you will need 
to configure Google's API Key and Firebase, so you can
provide these environment variables in files 
`/src/services/firebaseConnection.ts` and
`/src/pages/api/auth/[...nextAuth].ts`.

For `[...nextAuth].ts` to make login with google credentials:

```js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
      })
  ],
  secret: process.env.JWT_SECRET as string 
};
export default NextAuth(authOptions);
```

Above is the code that provides the configuration of the OAuth for NextAuth, 
in this case we're using GoogleProvider, you will have to configurate your
api keys at [Google Cloud API's Credentials](https://console.cloud.google.com/apis/credentials).
Plus, `JWT_SECRET` is recommended for more security, you can create a hash
with some generator like base64 or md5 too.

For `firebaseConnection.ts`:
```js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY as string,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_PROJECTID as string,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID as string,
  appId: process.env.NEXT_PUBLIC_APPID as string
};                                                                                                                                                                                                                                              
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
```

Here, above, there will be a lot of credentials to pass to firebase, when you create
the database all this values will be showed to you, you can copy then and paste
in the archive, so the connection can be done.
In this case, all the values are stores in the `.env` file and with the prefix
`NEXT_PUBLIC_*`, this occurs because Next imposes this rule for [Client-Side 
environment variables](https://nextjs.org/docs/pages/guides/environment-variables#bundling-environment-variables-for-the-browser).

> You can run the project with `yarn dev`.  And if you want to build it, 
there is `yarn build` (to actively build it for production) and `yarn start` 
(to serve the application and run it as production).