import strawberry
from graphql_schema.queries.user_queries import UserQuery

# Combine all queries
@strawberry.type
class Query(UserQuery):
    @strawberry.field
    def hello(self) -> str:
        return "BolKeOrder GraphQL API is alive!"

# Combine all mutations (mocked for now)
@strawberry.type
class Mutation:
    @strawberry.mutation
    def test_mutation(self) -> str:
        return "Success"

schema = strawberry.Schema(query=Query, mutation=Mutation)
