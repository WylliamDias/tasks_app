import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import styles from './styles.module.css';

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className={styles.header}>
      <section className={styles.content}>
        <nav className={styles.nav}>
          <Link href={'/'}>
            <h1 className={styles.logo}>
              Tarefas<span>+</span>
            </h1>
          </Link>
          {session?.user &&
            <Link className={styles.link} href={'/dashboard'}>
              Meu painel
            </Link>
          }
        </nav>
        {
          (() => {
            if (status === 'loading') return <></>
            const buttonText = session ? `Olá ${session.user?.name}` : 'Acessar'
            const clickAction = session ? () => signOut() : () => signIn('google');

            return <button className={styles.loginButton} onClick={clickAction}>{buttonText}</button>
          })()
        }

      </section>
    </header>
  );
}