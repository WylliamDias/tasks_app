import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Image from "next/image";
import heroImage from '../../public/assets/hero.png'
import { GetStaticProps } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";

interface HomeProps {
  amountOfPosts: number;
  amountOfComments: number;
}

export default function Home({ amountOfComments, amountOfPosts }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ - Organize facilmente suas tarefas</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo Tarefas"
            src={heroImage}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Sistema feito para você organizar <br />
          seus estudos e tarefas
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+{amountOfPosts} Posts</span>
          </section>
          <section className={styles.box}>
            <span>+{amountOfComments} Comentários</span>
          </section>
        </div>

      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {

  const commentRef = collection(db, 'comments');
  const tasksRef = collection(db, 'tarefas');

  const commentSnap = await getDocs(commentRef);
  const tasksSnap = await getDocs(tasksRef);

  return {
    props: {
      amountOfPosts: tasksSnap.size || 0,
      amountOfComments: commentSnap.size || 0
    },
    revalidate: 120
  }
};