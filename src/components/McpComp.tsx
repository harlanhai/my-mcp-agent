import React, { useState, useRef, useEffect } from 'react';
import { TextField, Paper, Typography, CircularProgress, ThemeProvider, Box, IconButton, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { CssBaseline } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { darkTheme } from '@/utils/muiTheme';
import { MastraClient } from '@mastra/client-js';
import { isWeatherQuery, isCodeQuery } from '@/utils/mcp'; // 引入查询分类器函数
import robotImage from '@assets/images/robot.png'; // 导入机器人头像

// const baseUrl = 'https://harlan-mcp-production.harlanhai7023.workers.dev';
const baseUrl = 'https://my-mastra-app-production.harlanhai7023.workers.dev'; // 生产环境
// const baseUrl = 'http://localhost:4111'; // 本地开发环境
const client = new MastraClient({ baseUrl: baseUrl });
const weatherAgent = client.getAgent('weatherAgent');
const codeCheckAgent = client.getAgent('codeCheckAgent');
const routerAgent = client.getAgent('routerAgent');

// 定义消息类型
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'MCP';
  timestamp: Date;
}

const McpComponent: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 当消息列表更新时，滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 判断用户输入的消息类型
  const typeAgents = (input: string): string => {
    // 简单的路由逻辑
    let agentName;

    if (isWeatherQuery(input)) {
      agentName = 'weatherAgent';
    } else if (isCodeQuery(input)) {
      agentName = 'codeCheckAgent';
    } else {
      // 提供一个默认响应
      agentName = 'defaultAgent';
    }
    return agentName;
  };
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const agentName = typeAgents(input);
    console.log('agentName', agentName);
    // 创建用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    // 更新消息列表，添加用户消息
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput(''); // 清空输入框

    try {
      let response;
      if (agentName === 'weatherAgent') {
        response = await weatherAgent.generate({
          messages: [
            {
              role: 'user',
              content: userMessage.text,
            },
          ],
        });
      } else if (agentName === 'codeCheckAgent') {
        response = await codeCheckAgent.generate({
          messages: [
            {
              role: 'user',
              content: userMessage.text,
            },
          ],
        });
      } else {
        response = await routerAgent.generate({
          messages: [
            {
              role: 'user',
              content: userMessage.text,
            },
          ],
        });
      }
      // 创建机器人回复消息
      const mcpMessage: Message = {
        id: response?.response.id as string,
        text: response?.text as string,
        sender: 'MCP',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, mcpMessage]);
    } catch (error) {
      console.error('发送消息错误:', error);

      // 创建错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `发生未知错误，请稍后再试。`,
        sender: 'MCP',
        timestamp: new Date(),
      };

      // 更新消息列表，添加错误消息
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
    setIsLoading(false); // 设置加载状态
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsLoading(true); // 设置加载状态
      // 发送消息
      handleSendMessage();
    }
  };

  // 格式化消息时间戳
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="flex flex-col h-screen bg-gray-900 overflow-hidden">
        {/* 标题栏 */}
        <div className="bg-gray-800 py-4 px-6 shadow-md">
          <Typography variant="h5" className="text-center font-semibold text-green-500">
            Harlan's MCP
          </Typography>
        </div>

        {/* 消息区域 */}
        <div className="w-full flex-grow px-0 mx-auto overflow-y-scroll">
          <div
            className="flex-grow p-4 pb-4 space-y-4 h-fit"
            // style={scrollbarStyles.scrollContainer}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Typography variant="body1" className="mb-2">
                  开始一个新的对话
                </Typography>
                <Typography variant="body2">发送消息开始聊天</Typography>
              </div>
            ) : (
              <div className="space-y-4 p-4 pb-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex items-start max-w-3xl">
                      {message.sender === 'MCP' && <Avatar className="mt-1 mr-2 text-sm" src={robotImage} />}
                      <Paper
                        elevation={1}
                        className={`p-3 rounded-2xl ${message.sender === 'user' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-100'}`}
                      >
                        <Typography variant="body1" component="div" className="whitespace-pre-wrap">
                          {/* 使用 markdown 过滤返回数据 */}
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        </Typography>
                        <Typography variant="caption" className="block mt-1 text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Paper>
                      {message.sender === 'user' && <Avatar className="mt-1 ml-2 bg-blue-600">我</Avatar>}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <Paper elevation={1} className="p-4 bg-gray-700 text-white rounded-2xl">
                      <Box display="flex" alignItems="center">
                        <CircularProgress size={20} className="mr-2" />
                        <Typography variant="body2">思考中...</Typography>
                      </Box>
                    </Paper>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-700 flex justify-center">
          <div className="w-4/5">
            <Box
              component="form"
              className="flex items-center space-x-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="输入消息..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={3}
                disabled={isLoading}
                className="bg-gray-700 rounded-xl"
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="h-12 w-12 bg-green-600 hover:bg-green-700 text-white"
                aria-label="发送"
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Box>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default McpComponent;
