export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    // check that email exists
    if (!email) {
      throw new Error("Please provide an email");
    }

    // check if the email is already subscribed
    const subRes = await fetch(
      `https://api.convertkit.com/v3/subscribers?api_secret=${
        import.meta.env.CONVERT_KIT_SECRET_KEY
      }&email_address=${email}`
    );

    if (!subRes.ok) {
      throw new Error("Something went wrong");
    }

    const subData = await subRes.json();
    const isSubscribed = subData.total_subscribers > 0;

    if (isSubscribed) {
      return new Response(
        JSON.stringify({
          message: "You're already subscribed!",
        }),
        {
          status: 200,
          statusText: "OK",
        }
      );
    }

    // subscribe email
    const res = await fetch(
      `https://api.convertkit.com/v3/forms/${
        import.meta.env.CONVERT_KIT_SUBSCRIBE_FORM_ID
      }/subscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          api_key: import.meta.env.CONVERT_KIT_API_KEY,
          email,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Something went wrong with your subscription");
    }

    const resText = await res.json();

    if (resText.error) {
      throw new Error(resText.error.message);
    }

    return new Response(
      JSON.stringify({
        message:
          "Thanks! Please check your email to confirm your subscription.",
      }),
      {
        status: 200,
        statusText: "OK",
      }
    );
  } catch (e) {
    if (e instanceof Error) {
      return new Response(null, {
        status: 400,
        statusText: e.message,
      });
    }
    return new Response(null, {
      status: 400,
      statusText: "There is an unexpected error",
    });
  }
};
