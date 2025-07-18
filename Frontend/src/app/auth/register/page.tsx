
import RegisterForm from '@/app/auth/register/register-form';
import Link from 'next/link';

function RegisterPage() {
  return (
    <div className="bodywrap" style={{ marginTop: '-30px' }}>
      <section className="section">
        <div className="container ">
          <div className="wrap_background_aside  page_login">
            <div className="wrap_background_aside">
              <div className="row">
                <div className="col-lg-5 col-md-6 col-sm-12 col-12 col-xl-4 offset-xl-4 offset-lg-4 offset-md-3 offset-xl-3">
                  <div className="row">
                    <div className="page-login pagecustome clearfix">
                      <div className="wpx">
                        <h1 className="title_heads a-center">
                          <span>Đăng ký</span>
                        </h1>
                        <span className="block a-center dkm margin-top-10">
                          Đã có tài khoản, đăng nhập{' '}
                          <Link href="/auth/login" className="btn-link-style btn-register">
                            Đăng ký tại đây
                          </Link>
                        </span>
                        <RegisterForm />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RegisterPage;