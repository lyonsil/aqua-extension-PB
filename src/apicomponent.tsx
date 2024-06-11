// apicomponent.tsx

const postData = async (): Promise<string> => {
  const url = 'https://tmv9bz5v4q.us-east-1.awsapprunner.com/latest/token';
  const username = 'platform.bible.test';
  const password = 'coOpacqF6tW6';
  const params = new URLSearchParams();
  params.append('grant_type', '');
  params.append('username', username);
  params.append('password', password);
  params.append('scope', '');
  params.append('client_id', '');
  params.append('client_secret', '');

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    accept: 'application/json',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    // eslint-disable-next-line no-type-assertion/no-type-assertion
    throw new Error(error as string);
  }
};

export default postData;
