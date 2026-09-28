# Engineering Upscale

## Objectivo

Elevar o MED Project de um monorepo funcional para uma base de produção mais previsível, auditável e segura.

## Eixos

### API
- contratos de entrada/saída explícitos com DTOs e validação;
- tipagem forte no domínio e eliminação progressiva de `any`;
- autenticação com rotação e revogação de refresh tokens;
- CORS por allowlist;
- limites de upload aplicados antes da alocação excessiva de memória;
- logs estruturados com correlação por `x-request-id`;
- auditoria desacoplada do ciclo de resposta;
- health/readiness checks;
- paginação consistente e limites máximos;
- testes unitários + integração + E2E;
- documentação OpenAPI como contrato verificável.

### CI/CD
- lint sem `--fix` no CI;
- typecheck explícito;
- Prisma validate/generate;
- testes com PostgreSQL real;
- builds das três aplicações;
- CodeQL;
- Dependabot para dependências e GitHub Actions;
- concorrência para cancelar execuções obsoletas;
- permissões mínimas no workflow.

### Leitura inteligente de manuais

O fluxo actual é:

`PDF -> OCR -> chunks -> LLM -> normalização -> Excel`

A evolução proposta é:

`PDF -> OCR por página -> segmentação semântica -> extracção estruturada -> validação determinística -> deduplicação -> revisão humana -> Excel`

Princípios:
1. preservar a página de origem;
2. nunca tratar a saída do modelo como verdade sem validação;
3. usar saída estruturada quando disponível;
4. manter evidência textual para cada item;
5. detectar conflitos e baixa confiança como avisos;
6. retry limitado para falhas transitórias;
7. não perder um manual inteiro por causa de um único chunk;
8. manter métricas da extracção: páginas, chunks, itens, rejeições, duplicados e duração;
9. tornar o processo determinístico onde possível;
10. separar extracção, validação e apresentação.

## Próximas fases

1. Hardening de entrada/saída da API.
2. Extracção estruturada e rastreável.
3. Suite de testes para OCR/IA/normalização.
4. Observabilidade e métricas.
5. Execução assíncrona para manuais grandes.
6. Quality gate no CI para regressões de extracção.
