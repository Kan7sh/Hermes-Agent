import { generateTokens } from "@/app/helpers/jwt";
import { User } from "@/models/UserSchema";
import { GoogleUserType } from "@/types/user-types";

export class UserRepo {
  private static instance: UserRepo;

  public static getInstance(): UserRepo {
    if (!UserRepo.instance) {
      UserRepo.instance = new UserRepo();
    }
    return UserRepo.instance;
  }

  async createUser(
    userProps: GoogleUserType,
    token: { accessToken: string; refreshToken: string },
  ) {
    const { sub: id, name, picture, email } = userProps?._json;
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      const user = new User({
        name: name,
        email: email,
        image: picture,
        googleAccessToken: token?.accessToken,
        googleRefreshToken: token?.refreshToken,
        googleId: id,
      });

      const newUser = await user.save();
      const { accessToken, refreshToken } = await generateTokens(newUser?._id);

      return {
        authData:{
            ...newUser.toObject(),
            token:{accessToken,refreshToken}
        }
      }
    }else{
        const user = await User.findByIdAndUpdate(existingUser?._id,{
            googleAccessToken:token?.accessToken,
            googleRefreshToken:token?.refreshToken
        },{new:true,runValidators:true});
        const updateUser = user?.toObject();
        const {accessToken,refreshToken} = await generateTokens(existingUser?._id);

        return {
            authData:{
            ...updateUser,
            token:{accessToken,refreshToken}            }
        }
    }
  }
}
