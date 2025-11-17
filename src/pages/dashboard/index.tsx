import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { getSession } from 'next-auth/react';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { FiShare2 } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';

import { Textarea } from '@/components/textarea';

import styles from './styles.module.css';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/services/firebaseConnection';
import Link from 'next/link';

interface DashboardProps {
  user: {
    email: string;
  }
}

interface TaskProps {
  id: string;
  created: Date;
  public: boolean;
  tarefa: string;
  user: string;
}

export default function Dashboard({ user }: DashboardProps) {
  const [input, setInput] = useState('');
  const [publicTask, setPublicTask] = useState(false);
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  useEffect(() => {
    async function getTarefas() {
      const tarefasRef = collection(db, 'tarefas');

      const q = query(
        tarefasRef,
        orderBy('created', 'desc'),
        where('user', '==', user?.email)
      );

      return onSnapshot(q, (snap) => {
        const allTasks: TaskProps[] = snap.docs.map(doc => {
          return {
            id: doc.id,
            created: doc.data().tarefa,
            public: doc.data().public,
            tarefa: doc.data().tarefa,
            user: doc.data().user,
          };
        });

        setTasks(allTasks);
      });
    }

    const unsubscribePromise = getTarefas();

    return () => {
      async function unsubscribeSnapShot() {
        const unsubscribe = await unsubscribePromise;
        unsubscribe();
      }

      unsubscribeSnapShot();
    };
  }, []);

  function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
    setPublicTask(event.target.checked);
  }

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault();

    if (input === '') return;

    try {
      await addDoc(collection(db, 'tarefas'), {
        tarefa: input,
        created: new Date(),
        user: user?.email,
        public: publicTask
      });

      setInput('');
      setPublicTask(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleShare(taskId: string) {
    await navigator.clipboard.writeText(`${window.location.host}/task/${taskId}`);
  }

  async function handleDeleteTask(taskId: string) {
    const docRef = doc(db, 'tarefas', taskId);
    await deleteDoc(docRef);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu Painel de Tarefas</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>
              Qual sua tarefa?
            </h1>

            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder='Digite qual sua tarefa...'
                value={input}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
              />
              <div className={styles.checkboxArea}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar tarefa publica?</label>
              </div>

              <button type="submit" className={styles.submitButton}>
                Registrar
              </button>
            </form>
          </div>
        </section>

        <section className={styles.taskContainer}>
          <h1>Minhas tarefas</h1>

          {
            tasks.map(task => {
              return (
                <article key={task.id} className={styles.task}>
                  {
                    task.public &&
                    <div className={styles.tagContainer}>
                      <label className={styles.tag}>PUBLICO</label>
                      <button className={styles.shareButton} onClick={() => handleShare(task.id)}>
                        <FiShare2
                          size={22}
                          color='#3183ff'
                        />
                      </button>
                    </div>
                  }

                  <div className={styles.taskContent}>
                    {
                      (task.public && <Link href={`/task/${task.id}`} children={<p>{task.tarefa}</p>} />)
                      || <p>{task.tarefa}</p>
                    }
                    <button className={styles.trashButton} onClick={() => handleDeleteTask(task.id)}>
                      <FaTrash
                        size={24}
                        color='#ea3140'
                      />
                    </button>
                  </div>
                </article>
              );
            })
          }

        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    };
  }

  return {
    props: {
      user: {
        email: session?.user?.email
      }
    }
  };
}