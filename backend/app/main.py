from fastapi import FastAPI
from pydantic import BaseModel
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END
from typing import Annotated, List
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins='http://localhost:3000/',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
load_dotenv()
class State(BaseModel):
    messages:Annotated[List,add_messages]  

class Base(BaseModel):
    user: str
llm = ChatGroq(model='deepseek-r1-distill-llama-70b')
tool = TavilySearchResults(max_results=2)
tools = [tool]
llm_with_tools= llm.bind_tools(tools)
memory = MemorySaver()
config = {'configurable':{'thread_id':'1'}}
@app.get('/')
def hello():    
    return 'hello'


@app.post('/chat')
async def items(message:Base):
    graph_builder = StateGraph(State)
    def chatbot(state:State):
        return {'messages': [llm_with_tools.invoke(state.messages)]}
    
    graph_builder.add_node('chatbot', chatbot)
    tool_node = ToolNode(tools=[tool])
    graph_builder.add_node('tools',tool_node)
    graph_builder.add_conditional_edges('chatbot', tools_condition)
    graph_builder.add_edge('tools','chatbot')
    graph_builder.add_edge(START, 'chatbot')
    
    graph = graph_builder.compile(checkpointer=memory)
    output = []
    events =  graph.stream({'messages':[{'role':'user', 'content': message.user}]},
    config,
    stream_mode='values')
        # for value in event.values():
        #     output.append(value["messages"][-1].content)
    for event in events:
        output.append(event['messages'][-1])


    return output



