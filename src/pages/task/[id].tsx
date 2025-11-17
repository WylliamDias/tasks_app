import Head from 'next/head';
import styles from './styles.module.css';
import { GetServerSideProps } from 'next';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/services/firebaseConnection';
import { Textarea } from '@/components/textarea';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaTrash } from 'react-icons/fa';

interface CommentProps {
  id: string;
  comment: string;
  created: string;
  user: string;
  name: string;
  taskId: string;
};

interface TaskProps {
  task: {
    tarefa: string;
    created: string;
    public: boolean;
    user: string;
    taskId: string;
  };
  taskComments: CommentProps[]
};

export default function Task({ task, taskComments }: TaskProps) {
  const { data: session } = useSession();

  const [newCommentInput, setNewCommentInput] = useState('');
  const [comments, setComments] = useState<CommentProps[]>(taskComments || []);

  function handleTextareaInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setNewCommentInput(event.target.value);
  }

  async function handleSubmitComment(event: FormEvent) {
    event.preventDefault();

    if (newCommentInput === '') return;

    if (!session?.user?.email || !session?.user?.name) return;

    try {
      const newCommentDate = new Date()
      const docRef = await addDoc(collection(db, 'comments'), {
        comment: newCommentInput,
        created: newCommentDate,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: task.taskId
      });

      setComments(oldComments => {
        return [...oldComments, {
          id: docRef.id,
          comment: newCommentInput,
          created: newCommentDate.toLocaleDateString(),
          user: session?.user?.email as string,
          name: session?.user?.name as string,
          taskId: task.taskId
        }];
      });

      setNewCommentInput('');
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      const commentRef = doc(db, 'comments', commentId);
      await deleteDoc(commentRef);
      setComments(oldComments => {
        return oldComments.filter(comment => comment.id != commentId);
      });
    } catch (error) {
      console.error(`Failed to delete the comment: ${error}`);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da tarefa</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>
            {task.tarefa}
          </p>
        </article>
      </main>

      <section className={styles.commentsContainer}>
        <h2>Deixar comentário</h2>
        <form onSubmit={handleSubmitComment}>
          <Textarea
            value={newCommentInput}
            onChange={handleTextareaInputChange}
            placeholder='Digite seu comentário...'
          />
          <button disabled={!session?.user} type='submit' className={styles.submitButton}>Enviar comentário</button>
        </form>
      </section>

      <section className={styles.commentsContainer}>
        <h2>Todos comentários: </h2>
        {comments.length === 0 && <span>Nenhum comentário ainda...</span>}
        {comments.map(comment => {
          return (
            <article key={comment.id} className={styles.comment}>
              <div className={styles.headComment}>
                <label className={styles.commentsLabel}>{comment.name}</label>
                {
                  session?.user?.email === comment.user &&
                  <button className={styles.trashButton} onClick={() => handleDeleteComment(comment.id)}>
                    <FaTrash size={18} color='#EA1340' />
                  </button>
                }
              </div>
              <p>{comment.comment}</p>
            </article>
          )
        })}
      </section>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const redirectToHome = {
    redirect: {
      destination: '/',
      permanent: false
    }
  };

  if (!id) return redirectToHome;

  const commentsQuery = query(collection(db, 'comments'), where('taskId', '==', id));

  const commentsDocs = await getDocs(commentsQuery);

  const comments: CommentProps[] = commentsDocs.docs.map(doc => {
    const docData = doc.data()
    const dateInMilliseconds = docData?.created?.seconds * 1000;

    return {
      id: doc.id,
      comment: docData?.comment,
      created: new Date(dateInMilliseconds).toLocaleDateString(),
      user: docData?.user,
      name: docData?.name,
      taskId: docData?.taskId
    };
  })

  const docRef = doc(db, 'tarefas', id);
  const snap = await getDoc(docRef);

  if (snap.data() === undefined) {
    return redirectToHome;
  }

  if (!snap.data()?.public) {
    return redirectToHome;
  }

  const taskData = snap.data();
  const miliseconds = taskData?.created?.seconds * 1000;

  const task = {
    tarefa: taskData?.tarefa,
    created: new Date(miliseconds).toLocaleDateString(),
    public: taskData?.public,
    user: taskData?.user,
    taskId: id
  }

  return {
    props: {
      task: task,
      taskComments: comments
    }
  };
}