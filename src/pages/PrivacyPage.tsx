const UPDATED_AT = '29 de outubro de 2026'
const CONTACT_EMAIL = 'contato@zarpa.tech'

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10 text-cellar-900">
      <h1 className="text-2xl font-semibold">Política de Privacidade</h1>
      <p className="mt-1 text-sm text-cellar-700">Última atualização: {UPDATED_AT}</p>

      <div className="mt-6 flex flex-col gap-6 text-sm leading-relaxed text-cellar-900">
        <section>
          <p>
            Esta Política de Privacidade descreve como o MyCellar ("nós", "aplicativo") coleta, usa,
            armazena e protege os dados pessoais de quem usa o serviço, em conformidade com a Lei
            Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Ao criar uma conta, você concorda
            com as práticas descritas aqui.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">1. Quais dados coletamos</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong>Dados de cadastro:</strong> email e senha (a senha é armazenada de forma
              criptografada pelo nosso provedor de autenticação; nunca temos acesso a ela em texto
              puro).
            </li>
            <li>
              <strong>Dados da sua coleção:</strong> informações que você cadastra sobre suas garrafas
              (nome, tipo, uvas, país, região, vinícola, safra, nota pessoal, notas de degustação) e
              sobre o layout da sua adega (prateleiras, capacidade).
            </li>
            <li>
              <strong>Fotos que você envia:</strong> fotos de rótulos de garrafas e, opcionalmente, uma
              foto real da sua adega usada como fundo visual.
            </li>
            <li>
              <strong>Preferências:</strong> idioma selecionado e modo de visualização da adega.
            </li>
            <li>
              <strong>Dados técnicos:</strong> informações básicas de uso e acesso necessárias para o
              funcionamento e segurança do serviço (ex: registros de autenticação).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">2. Como usamos seus dados</h2>
          <p className="mt-2">Usamos os dados coletados exclusivamente para:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Autenticar seu acesso e manter sua conta segura;</li>
            <li>Exibir, organizar e permitir a edição da sua coleção de vinhos;</li>
            <li>
              Processar fotos de rótulos através de inteligência artificial, quando você usa o recurso
              de escaneamento, para pré-preencher automaticamente os dados da garrafa;
            </li>
            <li>Aplicar suas preferências de idioma e exibição;</li>
            <li>Exibir anúncios (Google AdSense), quando essa funcionalidade estiver ativa;</li>
            <li>Diagnosticar problemas técnicos e melhorar o serviço.</li>
          </ul>
          <p className="mt-2">
            Não vendemos seus dados pessoais nem os usamos para finalidades diferentes das descritas
            aqui.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">3. Com quem compartilhamos dados</h2>
          <p className="mt-2">
            Usamos os seguintes prestadores de serviço (operadores de dados) para fazer o MyCellar
            funcionar:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong>Supabase:</strong> hospeda nosso banco de dados, autenticação e armazenamento de
              arquivos (fotos).
            </li>
            <li>
              <strong>Anthropic (API Claude):</strong> processa a foto do rótulo quando você usa o
              escaneamento por IA, apenas para extrair os dados da garrafa — a foto é enviada para esse
              processamento pontual e não é usada para treinar modelos de IA de terceiros.
            </li>
            <li>
              <strong>Google AdSense:</strong> quando ativo, pode coletar dados de navegação para exibir
              anúncios. O Google tem sua própria política de privacidade, disponível em{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                policies.google.com/privacy
              </a>
              .
            </li>
          </ul>
          <p className="mt-2">
            Não compartilhamos seus dados com terceiros para fins de marketing de terceiros.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">4. Cookies e armazenamento local</h2>
          <p className="mt-2">
            Usamos armazenamento local do navegador (localStorage) para manter sua sessão ativa e
            lembrar sua preferência de idioma. Se a funcionalidade de anúncios estiver ativa, o Google
            AdSense pode usar cookies próprios conforme a política dele.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">5. Seus direitos</h2>
          <p className="mt-2">Conforme a LGPD, você tem direito a:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Confirmar a existência e acessar os dados que temos sobre você;</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados (você pode editar a maioria diretamente no app);</li>
            <li>Solicitar a exclusão dos seus dados e da sua conta;</li>
            <li>Solicitar a portabilidade dos seus dados (exportação em CSV/JSON, disponível em Ajustes);</li>
            <li>Revogar seu consentimento a qualquer momento.</li>
          </ul>
          <p className="mt-2">
            Para exercer qualquer um desses direitos, entre em contato em{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">6. Retenção e exclusão de dados</h2>
          <p className="mt-2">
            Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar a exclusão da conta,
            removemos seus dados pessoais e sua coleção dos nossos sistemas, exceto quando a retenção
            for exigida por lei.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">7. Segurança</h2>
          <p className="mt-2">
            Adotamos medidas técnicas razoáveis para proteger seus dados, incluindo controle de acesso
            por usuário (cada pessoa só acessa sua própria coleção) e conexões criptografadas (HTTPS).
            Nenhum sistema é 100% livre de risco, e nos comprometemos a agir rapidamente em caso de
            incidente de segurança.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">8. Menores de idade</h2>
          <p className="mt-2">
            O MyCellar não é direcionado a menores de 18 anos, por lidar com conteúdo relacionado a
            bebidas alcoólicas. Não coletamos intencionalmente dados de menores de idade.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">9. Alterações nesta política</h2>
          <p className="mt-2">
            Podemos atualizar esta Política de Privacidade periodicamente. Mudanças relevantes serão
            comunicadas dentro do aplicativo. A data no topo desta página indica a versão mais recente.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">10. Contato</h2>
          <p className="mt-2">
            Dúvidas sobre esta política ou sobre seus dados podem ser enviadas para{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
