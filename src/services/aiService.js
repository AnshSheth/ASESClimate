import { Configuration, OpenAIApi } from 'openai';

export const generatePersonalizedContent = async (userData) => {
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY
  });
  const openai = new OpenAIApi(configuration);

  try {
    console.log('Making API request...');
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert climate educator who creates engaging, personalized content. Format your response in clear sections with headers. Use only **text** for emphasis and headers, do not use #, ##, or ### formatting."
        },
        {
          role: "user",
          content: `Create an AT MOST 300-word climate change course divided into 3 sections. 
          Use **Section X:** for section headers and **bold** for emphasis. Do not use #, ##, or ### formatting.
          
          Tailor it for a student with these characteristics:
          - Age: ${userData.age}
          - Location: ${userData.location}
          - Interests: ${userData.interests.join(', ')}
          - Learning Style: ${userData.learningStyle}
          
          Make the content engaging and relevant to their location and interests.
          Use examples that connect to their interests.
          Adapt the language and complexity to their age.
          Structure the response with clear section headers using **Section X:** format.
          Format the content to match their learning style.`
        }
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    console.log('Full API Response:', {
      status: response.status,
      data: response.data
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a minute and try again.');
    }
    throw error;
  }
};

export const enhanceDocument = async (file, subjectArea = 'math') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject_area', subjectArea);

    const response = await fetch('http://localhost:8000/api/enhance-document', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to enhance document');
    }

    return response.json();
}; 