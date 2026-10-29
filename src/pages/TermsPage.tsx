const UPDATED_AT = '29 de outubro de 2026'
const CONTACT_EMAIL = 'contato@zarpa.tech'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10 text-cellar-900">
      <h1 className="text-2xl font-semibold">Termos de Uso</h1>
      <p className="mt-1 text-sm text-cellar-700">Última atualização: {UPDATED_AT}</p>

      <div className="mt-6 flex flex-col gap-6 text-sm leading-relaxed text-cellar-900">
        <section>
          <p>
            Estes Termos de Uso regulam o uso do MyCellar, um aplicativo para gerenciamento pessoal de
            adegas de vinho. Ao criar uma conta ou usar o serviço, você concorda com estes termos. Se
            não concordar, não utilize o MyCellar.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">1. Descrição do serviço</h2>
          <p className="mt-2">
            O MyCellar permite cadastrar, organizar e acompanhar uma coleção pessoal de vinhos,
            incluindo o registro da posição física das garrafas, histórico de consumo e, opcionalmente,
            o reconhecimento automático de dados de rótulos por inteligência artificial.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">2. Cadastro e conta</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Você precisa ter 18 anos ou mais para usar o MyCellar.</li>
            <li>Você é responsável por manter a confidencialidade da sua senha e por toda atividade realizada na sua conta.</li>
            <li>As informações fornecidas no cadastro devem ser verdadeiras e atualizadas.</li>
            <li>Você pode solicitar a exclusão da sua conta a qualquer momento.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">3. Uso aceitável</h2>
          <p className="mt-2">Ao usar o MyCellar, você concorda em não:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Usar o serviço para fins ilegais ou não autorizados;</li>
            <li>Tentar acessar dados de outros usuários ou contornar os mecanismos de segurança;</li>
            <li>Enviar conteúdo ofensivo, ilegal ou que viole direitos de terceiros através das fotos ou textos cadastrados;</li>
            <li>Usar meios automatizados (bots, scraping) para acessar o serviço sem autorização;</li>
            <li>Sobrecarregar deliberadamente a infraestrutura do serviço.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">4. Seu conteúdo</h2>
          <p className="mt-2">
            Você mantém todos os direitos sobre os dados e fotos que cadastra no MyCellar. Ao enviá-los,
            você nos concede uma licença limitada para armazenar, processar e exibir esse conteúdo
            exclusivamente para fornecer o serviço a você — não reivindicamos propriedade sobre o seu
            conteúdo, e ele não é compartilhado publicamente nem com outros usuários.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">5. Reconhecimento de rótulos por IA</h2>
          <p className="mt-2">
            O recurso de escaneamento de rótulos usa inteligência artificial para extrair dados
            automaticamente a partir de uma foto. Essa extração pode conter erros ou imprecisões —
            você é responsável por revisar e corrigir as informações antes de salvar. Por envolver
            processamento externo, o uso desse recurso pode estar sujeito a limites diários.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">6. Propriedade intelectual</h2>
          <p className="mt-2">
            O MyCellar, incluindo seu código, design, marca e funcionalidades, é de propriedade dos
            desenvolvedores do serviço. Estes termos não concedem a você nenhum direito sobre essa
            propriedade intelectual, além do direito de uso do aplicativo conforme aqui descrito.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">7. Isenção de garantias</h2>
          <p className="mt-2">
            O MyCellar é fornecido "como está", sem garantias de qualquer tipo, explícitas ou
            implícitas. Não garantimos que o serviço será ininterrupto, livre de erros, ou que o
            reconhecimento automático de rótulos será sempre preciso. Você usa o serviço por sua conta
            e risco.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">8. Limitação de responsabilidade</h2>
          <p className="mt-2">
            Na máxima extensão permitida por lei, não nos responsabilizamos por danos indiretos,
            incidentais ou consequenciais resultantes do uso ou da impossibilidade de uso do serviço,
            incluindo eventual perda de dados. Recomendamos exportar periodicamente sua coleção (recurso
            disponível em Ajustes) como backup pessoal.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">9. Suspensão e encerramento</h2>
          <p className="mt-2">
            Podemos suspender ou encerrar contas que violem estes termos. Você pode encerrar sua conta a
            qualquer momento solicitando a exclusão dos seus dados.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">10. Alterações nestes termos</h2>
          <p className="mt-2">
            Podemos atualizar estes Termos de Uso periodicamente. Mudanças relevantes serão comunicadas
            dentro do aplicativo. O uso continuado do serviço após uma alteração implica concordância
            com os novos termos.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">11. Lei aplicável</h2>
          <p className="mt-2">
            Estes termos são regidos pelas leis da República Federativa do Brasil, incluindo a Lei Geral
            de Proteção de Dados (LGPD).
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-cellar-900">12. Contato</h2>
          <p className="mt-2">
            Dúvidas sobre estes termos podem ser enviadas para{' '}
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
